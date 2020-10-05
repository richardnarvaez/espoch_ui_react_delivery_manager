import app from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

const config = {
	apiKey: 'AIzaSyDfMHgDm1Vj3Yeu8jsZiPTgmdJKYuicpGU',
	authDomain: 'delivery-chas.firebaseapp.com',
	databaseURL: 'https://delivery-chas.firebaseio.com',
	projectId: 'delivery-chas',
	storageBucket: 'delivery-chas.appspot.com',
	messagingSenderId: '492845799556',
	appId: '1:492845799556:web:3557f1bb9d99a1c4d60ad1',
	measurementId: 'G-3FJLSVQRBK',
}

class Firebase {
	constructor() {
		if (!app.apps.length) {
			app.initializeApp(config)
		}

		/* Helper */
		this.server =
			process.env.NODE_ENV == 'development'
				? 'development'
				: process.env.NEXT_PUBLIC_STAGING == 'test'
				? 'development'
				: 'production'

		this.serverValue = app.database.ServerValue
		this.emailAuthProvider = app.auth.EmailAuthProvider

		/* Firebase APIs */

		this.auth = app.auth()
		this.a = app.auth
		this.db = app.database()
		this.bRef = this.db.ref(this.server)

		/* Social Sign In Method Provider */

		this.googleProvider = new app.auth.GoogleAuthProvider()
		this.facebookProvider = new app.auth.FacebookAuthProvider()
		this.twitterProvider = new app.auth.TwitterAuthProvider()
	}

	/* Authentication */

	doCreateUserWithEmailAndPassword = (email, password) =>
		this.auth.createUserWithEmailAndPassword(email, password)

	doSignInWithEmailAndPassword = (email, password) =>
		this.auth.signInWithEmailAndPassword(email, password)

	doSignInWithGoogle = () => this.auth.signInWithPopup(this.googleProvider)

	doSignInWithFacebook = () => this.auth.signInWithPopup(this.facebookProvider)

	doSignInWithTwitter = () => this.auth.signInWithPopup(this.twitterProvider)

	doSignOut = () => {
		this.auth.signOut()
	}

	doPasswordReset = (email) => this.auth.sendPasswordResetEmail(email)

	doSendEmailVerification = () =>
		this.auth.currentUser.sendEmailVerification({
			url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT,
		})

	doPasswordUpdate = (password) => this.auth.currentUser.updatePassword(password)

	onAuthUserListener = (next, fallback) =>
		this.auth.onAuthStateChanged((authUser) => {
			if (authUser) {
				this.user(authUser.uid)
					.once('value')
					.then((snapshot) => {
						if (snapshot.exists) {
						}
						const dbUser = snapshot.val()

						// default empty roles

						if (!dbUser.roles) {
							dbUser.roles = {}
						}

						// merge auth and db user
						authUser = {
							uid: authUser.uid,
							email: authUser.email,
							emailVerified: authUser.emailVerified,
							providerData: authUser.providerData,
							...dbUser,
						}

						next(authUser)
					})
			} else {
				fallback()
			}
		})
	/* Authentication */

	/* AdminPanel */
	admin = (uid) => this.bRef.child(`admins/${uid}`)
	admins = () => this.bRef.child(`admins`)

	user = (uid) => this.bRef.child(`users/${uid}`)
	users = () => this.bRef.child('users')

	/* Message API */
	message = (uid) => this.bRef.child(`messages/${uid}`)
	messages = () => this.bRef.child('messages')

	async getLive(url, funData, funError) {
		console.log('soy URL GETLIVE ' + url)
		await this.bRef.child(url).on('value', funData, funError)
	}

	async get(url, funData, funError) {
		console.log('soy URL GET ' + url)
		await this.bRef.child(url).once('value', funData, funError)
	}

	setAdmin = (url, obj) => {
		let ref = this.bRef.child(url)
		// .push()
		// obj.id = ref.key
		try {
			this.bRef.child(url).update(obj)
		} catch (e) {
			console.log('OredersFragment', 'Error: ', e)
		}
	}

	update = (url, obj) => {
		this.bRef.child(url).update(obj)
	}

	updateOnComplete = (url, obj, funError) => {
		this.bRef.child(url).update(obj, funError)
	}

	setData = (url, obj) => {
		const ref = this.bRef.child(url)
		let id = ref.push().key
		obj._id = id
		ref.child(id).set(obj)
	}

	setCategory = (url, obj, funError) => {
		const ref = this.bRef.child(url)
		let id = ref.push().key
		obj._id = id
		ref.child(id).set(obj, funError)
	}

	setWorker = (url, obj) => {
		const ref = this.bRef.child(url)
		let id = ref.push().key

		this.bRef.child(id).set(obj)
		//this.bRef.child(url+"/"+obj.cedula).set(obj);
	}

	setFlota = (url, obj) => {
		this.bRef.child(url + obj.placa).set(obj)
	}

	async addWorker(urlFlota, urlWork, idFlota) {
		//asigno flota a trabajador
		let urlWorker = '/worker/' + urlWork
		var flota = { idFlota }
		await this.bRef.child(urlWorker).update(flota)

		//asigno trabajador a flota
		let idEmpleado = { id: urlWork }
		await this.bRef.child(urlFlota + '/workers/' + urlWork).update(idEmpleado)
	}

	async delete(url) {
		await this.bRef.child(url).remove()
	}

	async deleteFlota(urlFlota, idWorkers) {
		for (let i = 0; i < idWorkers.length; i++) {
			let urlWorker = '/worker/' + idWorkers[i].id + '/idFlota'

			await this.bRef.child(urlWorker).remove()
		}
		await this.bRef.child(urlFlota).remove()
	}

	async deleteWorker(urlWorker, urlFlota) {
		await this.bRef.child(urlWorker).remove()
		await this.bRef.child(urlFlota).remove()
	}

	/*.orderByChild("type")*/
	async getfilter(url, txtfilter, funData, funError) {
		if (txtfilter === 'Todos') {
			await this.bRef.child(url).on('value', funData, funError)
		} else {
			await this.bRef
				.child(url)
				.orderByChild('type')
				.equalTo(txtfilter)
				.on('value', funData, funError)
		}
	}

	async modify(url, obj) {
		await this.bRef.child(url).update(obj)
	}

	async search(url, type, search, funData, funError) {
		if (type === 'Todos') {
			await this.bRef.child(url).once('value', funData, funError)
		} else {
			await this.bRef
				.child(url)
				.orderByChild(type)
				.equalTo(search)
				.once('value', funData, funError)
		}
	}

	async filterDate(url, placa, funData, funError) {
		await this.bRef
			.child(url)
			.orderByChild('flota')
			.equalTo(placa)
			.once('value', funData, funError)
		//await this.bRef.child(url).orderByChild("date").startAt().endAt().once("value", funData , funError)
	}

	async filterProducts(url, id, funData, funError) {
		await this.bRef
			.child(url)
			.orderByChild('rid')
			.equalTo(id)
			.once('value', funData, funError)
	}

	/*********************  Chat functions *********************/
	async getBusinessContacts(url, funData, funError) {
		console.log('soy get Contacts: ', url)
		await this.bRef.child(url).orderByChild('date').on('value', funData, funError)
	}

	async getAuthorUser(url, funData, funError) {
		await this.bRef.child(url).once('value', funData, funError)
	}

	async getLastMsg(url, funData, funError) {
		console.log('soy Last MESSAGE: ', url)
		await this.bRef.child(url).limitToLast(1).on('child_added', funData, funError)
	}

	async getStateMsg(url, funData, funError) {
		await this.bRef.child(url).limitToLast(1).on('value', funData, funError)
	}
	// async getMessages(url, funData, funError){
	//   console.log("soy GET MESSAGE: ", url)
	//   await this.bRef.child(url).on("value", funData, funError)
	// }

	async checkMessage(url) {
		await this.bRef.child(url).child('state').set('check')
	}
}

export default Firebase

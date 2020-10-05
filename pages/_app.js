import Firebase, { FirebaseContext } from 'lib/Firebase'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
	return (
		<>
			<FirebaseContext.Provider value={new Firebase()}>
				<Component {...pageProps} />
			</FirebaseContext.Provider>
		</>
	)
}

export default MyApp

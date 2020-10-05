import { withFirebase } from 'lib/Firebase'
import Icon from 'lib/Icon/svg'

class CategoryFragment extends React.Component {
	constructor() {
		super()
		this.state = {
			uid: '',
			isEdit: false,
			list_products: null,
			list_categories: null,
			loading: true,
			cat: '',
			filterByCat: '',
		}
	}

	componentDidMount() {
		const { user, firebase } = this.props

		firebase.getLive(
			'menu/' + user.business,
			(_) => {
				console.log('DATOS: ', _.val())

				if (_.val() != null) {
					let listaCat = Object.values(_.val())
					let listaCatKeys = Object.keys(_.val())

					firebase.filterProducts(
						'products',
						user.business,
						(snap) => {
							console.log('SNAP ', snap.val())
							if (snap.val() != null) {
								console.log('SNAP PARCED ', Object.values(snap.val()))
								console.log('SNAP KEYS ', Object.keys(snap.val()))
								this.setState({
									loading: false,
									list_products: Object.values(snap.val()),
								})
							} else {
								this.setState({
									loading: false,
									list_products: null,
								})
							}
						},
						(err) => {
							console.log('Error ' + err)
						}
					)

					this.setState({
						list_categories: Object.values(_.val()),
					})
				} else {
					this.setState({
						loading: false,
						list_products: null,
						list_categories: null,
					})
				}
			},
			(err) => {
				console.log('Error ' + err)
			}
		)
	}

	addCategory = (e) => {
		e.preventDefault()
		
		const txt_title = document.getElementById('title_category').value
		const txt_description = document.getElementById('description_category').value

		console.log(txt_title, txt_description)
		const ref = 'menu/' + this.props.user.business

		this.props.firebase.setCategory(
			ref,
			{
				title: txt_title,
				description: txt_description,
				date: Date.now(),
				priority: 1,
				status: false,
			},
			(err) => {
				if (err) {
					console.log('Synchronization failed')
					alert('Hubo un error, intente de nuevo')
				} else {
					console.log('Synchronization succeeded')
					alert('Se agrego con exito la categoria ' + txt_title)
					$('#modalAdd').modal('toggle')
					document.getElementById('title_category').value = ''
					document.getElementById('description_category').value = ''
				}
			}
		)
	}

	addProduct = (e) => {
		e.preventDefault()
		const { user } = this.props

		const txt_image = document.getElementById('image_product').value
		const txt_title = document.getElementById('title_product').value
		const txt_description = document.getElementById('description_product').value
		const txt_price = document.getElementById('price_product').value

		const category = document.getElementById('selectCategory').value

		var newPostKey = this.props.firebase.bRef
			.child('menu/' + user.business + '/' + category + '/list')
			.push().key

		var updates = {}
		updates[
			'menu/' + user.business + '/' + category + '/list/' + newPostKey
		] = true
		updates['products/' + newPostKey] = {
			_id: newPostKey,
			title: txt_title,
			description: txt_description,
			price: txt_price,
			image: txt_image,
			rid: user.business,
			category,
		}

		this.props.firebase.bRef.update(updates, function (error) {
			if (error) {
				console.log('Synchronization failed')
				alert('Hubo un error, intente de nuevo')
			} else {
				console.log('Synchronization succeeded')
				alert('Se agrego con exito el producto ' + txt_title)
				$('#modalProduct').modal('toggle')
				document.getElementById('image_product').value = ''
				document.getElementById('title_product').value = ''
				document.getElementById('description_product').value = ''
				document.getElementById('price_product').value = ''
			}
		})
	}

	render() {
		const { list_products, list_categories, loading } = this.state

		if (loading) {
			return <>Cargando datos...</>
		} else {
			return (
				<>
					<div className="container">
						{list_categories !== null && list_categories !== undefined ? (
							<>
								<div className="row justify-content-between cont-box-user mt-5">
									<div className="col-4 cont-users">
										<div className="cont-name-users">
											<h1 className="">Lista de Productos</h1>
											<p>Crea tu lista de productos y categorias</p>
										</div>
									</div>
								</div>

								<button
									type="button"
									className="btn btn-primary mt-4"
									data-toggle="modal"
									data-target="#modalAdd">
									Añadir CATEGORIA
								</button>

								<div className="category-container">
									<ul>
										<Category
											onClick={() => this.setState({ filterByCat: '' })}
											item={{ title: 'All' }}
											key={-1}
										/>

										{list_categories.map((item, i) => {
											return (
												<Category
													onClick={() =>
														this.setState({ filterByCat: item._id ? item._id : '' })
													}
													item={item}
													key={i}
												/>
											)
										})}
									</ul>
								</div>

								{/**TODO: PONER EDITAR Y ELIMINAR */}
								{list_products === null ? (
									<>
										{' '}
										No hay productos
										<button
											type="button"
											className="btn btn-primary mt-4"
											data-toggle="modal"
											data-target="#modalProduct">
											Añadir PRODUCTO
										</button>
									</>
								) : (
									<div>
										<button
											type="button"
											className="btn btn-primary mt-4"
											data-toggle="modal"
											data-target="#modalProduct">
											Añadir PRODUCTO
										</button>
										<div>
											<ul className="table-products">
												<li class="table-header">
													<div class="column column-1 center-content">Imagen</div>
													<div class="column column-2 center-content">Nombre</div>
													<div class="column column-3 center-content">Descripción</div>
													<div class="column column-4 center-content">Precio</div>
												</li>
												{list_products && !this.state.filterByCat
													? list_products.map((item, i) => {
															return <ProductRow item={item} key={i} />
													  })
													: list_products
															.filter((pilot) => pilot.category === this.state.filterByCat)
															.map((item, i) => {
																return <ProductRow item={item} key={i} />
															})}
											</ul>
										</div>

										{/* <div className="row justify-content-end mr-2">
                                                <nav aria-label="Page navigation example">
                                                    <ul className="pagination">
                                                        <li className="page-item">
                                                            <a className="page-link" href="#" aria-label="Previous">
                                                                <span aria-hidden="true">&laquo;</span>
                                                            </a>
                                                        </li>
                                                        <li className="page-item"><a className="page-link" href="#">1</a></li>
                                                        <li className="page-item"><a className="page-link" href="#">2</a></li>
                                                        <li className="page-item"><a className="page-link" href="#">3</a></li>
                                                        <li className="page-item">
                                                            <a className="page-link" href="#" aria-label="Next">
                                                                <span aria-hidden="true">&raquo;</span>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div> */}
									</div>
								)}
							</>
						) : (
							<InitScreen />
						)}

						{/* Modal */}
						{/* <NormalModal id={this.state.uid} deleteU={() => this.deleteU(deleteUser, this.state.uid)} /> */}
					</div>

					{/* Modal Add Category */}
					<div
						className="modal fade"
						id="modalAdd"
						tabIndex="-1"
						role="dialog"
						aria-labelledby="exampleModalCenterTitle"
						aria-hidden="true">
						<div className="modal-dialog modal-dialog-centered" role="document">
							<form onSubmit={this.addCategory} className="modal-content">
								<div className="modal-header">
									<h5 className="modal-title" id="exampleModalCenterTitle">
										Agregar Categoria
									</h5>
									<button
										type="button"
										className="close"
										data-dismiss="modal"
										aria-label="Close">
										<span aria-hidden="true">&times;</span>
									</button>
								</div>
								<div className="modal-body">
									{/* priority: 2 */}
									{/* status:true */}

									<p>Nombre de la categoria</p>
									<input
										id="title_category"
										pattern="^[a-z A-Z \d ,.ñáéíóú]{2,20}$"
										required
									/>

									<p>Descripción</p>
									<input
										id="description_category"
										pattern="^[a-z A-Z \d ,.ñáéíóú]{2,60}$"
										required
									/>
								</div>
								<div className="modal-footer">
									<button
										type="button"
										className="btn btn-secondary"
										data-dismiss="modal">
										Cancelar
									</button>
									<button type="submit" className="btn btn-primary">
										Aceptar
									</button>
								</div>
							</form>
						</div>
					</div>

					{/* Modal Product */}
					<div
						className="modal fade"
						id="modalProduct"
						tabIndex="-1"
						role="dialog"
						aria-labelledby="exampleModalCenterTitle"
						aria-hidden="true">
						<div className="modal-dialog modal-dialog-centered" role="document">
							<form onSubmit={this.addProduct} className="modal-content">
								<div className="modal-header">
									<h5 className="modal-title" id="exampleModalCenterTitle">
										Añade un nuevo producto...
									</h5>
									<button
										type="button"
										className="close"
										data-dismiss="modal"
										aria-label="Close">
										<span aria-hidden="true">&times;</span>
									</button>
								</div>
								<div className="modal-body">
									{/* priority: 2 */}
									{/* status:true */}
									<p>Imagen del producto</p>
									<input id="image_product" type="url" required />

									<p>Nombre del producto</p>
									<input
										id="title_product"
										pattern="^[a-z A-Z \d ,.ñáéíóú]{2,20}$"
										required
									/>

									<p>Descripción del producto</p>
									<input
										id="description_product"
										pattern="^[a-z A-Z \d ,.ñáéíóú]{2,60}$"
										required
									/>

									<p>Precio</p>
									<input
										id="price_product"
										pattern="\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?"
										required
									/>

									<p>Categoria</p>
									<select className="custom-select" id="selectCategory">
										{list_categories !== null &&
											list_categories.map((item, i) => {
												return <option value={item._id}>{item.title}</option>
											})}
									</select>
								</div>

								<div className="modal-footer">
									<button
										type="button"
										className="btn btn-secondary"
										data-dismiss="modal">
										Cancelar
									</button>
									<button type="submit" className="btn btn-primary">
										Aceptar
									</button>
								</div>
							</form>
						</div>
					</div>

					{/* Modal Product */}
					<div
						className="modal fade"
						id="modalEditProduct"
						tabIndex="-1"
						role="dialog"
						aria-labelledby="exampleModalCenterTitle"
						aria-hidden="true">
						<div className="modal-dialog modal-dialog-centered" role="document">
							<form
								onSubmit={() => {
									alert('Solicitud enviada')
								}}
								className="modal-content">
								<div className="modal-header">
									<h5 className="modal-title" id="exampleModalCenterTitle">
										Editar
									</h5>
									<button
										type="button"
										className="close"
										data-dismiss="modal"
										aria-label="Close">
										<span aria-hidden="true">&times;</span>
									</button>
								</div>
								<div className="modal-body">
									{/* priority: 2 */}
									{/* status:true */}
									<p>Imagen del producto</p>
									<input id="image_product" type="url" required />

									<p>Nombre del producto</p>
									<input
										id="title_product"
										pattern="^[a-z A-Z \d ,.ñáéíóú]{2,20}$"
										required
									/>

									<p>Descripción del producto</p>
									<input
										id="description_product"
										pattern="^[a-z A-Z \d ,.ñáéíóú]{2,60}$"
										required
									/>

									<p>Precio</p>
									<input
										id="price_product"
										pattern="\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?"
										required
									/>

									<p>Categoria</p>
									<select className="custom-select" id="selectCategory">
										{list_categories !== null &&
											list_categories.map((item, i) => {
												return <option value={item._id}>{item.title}</option>
											})}
									</select>
								</div>

								<div className="modal-footer">
									<button
										onClick={() => {
											$('#modalEditProduct').modal('toggle')
											alert('Fue eliminado correctamente')
										}}
										className="btn btn-primary">
										Eliminar
									</button>
									<button
										type="button"
										className="btn btn-secondary"
										data-dismiss="modal">
										Cancelar
									</button>
									<button type="submit" className="btn btn-primary">
										Aceptar
									</button>
								</div>
							</form>
						</div>
					</div>
				</>
			)
		}
	}
}

class InitScreen extends React.Component {
	render() {
		return (
			<>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						height: '100vh',
					}}>
					<div style={{ textAlign: 'center' }}>
						<h1>SIN PRODUCTOS</h1>
						<p>Todavia no tienes ningún producto ni categoria.</p>
						<button
							type="button"
							className="btn btn-primary mt-4"
							data-toggle="modal"
							data-target="#modalAdd">
							Añadir CATEGORIA
						</button>
					</div>
				</div>
			</>
		)
	}
}

class Category extends React.Component {
	render() {
		const { item } = this.props
		return (
			<>
				<li>
					<button
						onClick={this.props.onClick}
						style={{
							background: 'transparent',
							border: 'none',
							margin: 5,
							padding: '10px 20px',
							background: '#ccc',
							borderRadius: 1000,
							maxWidth: 200,
							marginTop: 6,
							alignContent: 'center',
						}}>
						<p>{item.title}</p>
					</button>
				</li>
			</>
		)
	}
}

class ProductRow extends React.Component {
	render() {
		const { item } = this.props
		return (
			<>
				<li
					onClick={() => $('#modalEditProduct').modal('toggle')}
					class="table-row">
					<div class="column column-1 center-content">
						<img
							style={{
								borderRadius: 8,
								objectFit: 'cover',
								boxShadow: '0 2px 2px #0000001a',
							}}
							src={item.image}
							width={50}
							height={50}
						/>
					</div>
					<div class="column column-2 center-content" data-label="Nombre: ">
						{item.title}
					</div>
					<div class="column column-3 center-content" data-label="Descripción: ">
						{item.description}
					</div>
					<div class="column column-4 center-content" data-label="Precio: ">
						${item.price}
					</div>
				</li>
			</>
		)
	}
}

export default withFirebase(CategoryFragment)

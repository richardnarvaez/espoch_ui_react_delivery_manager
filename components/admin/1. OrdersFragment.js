import React, { useState, useEffect } from 'react'
import { withFirebase } from '../../lib/Firebase'

import { periods } from '../../utils/date'

const OrdersFragment = (props) => {
	const [loading, setLoading] = useState(true)
	const [isOpen, setIsOpen] = useState()
	const [allDataOrderBusiness, setAllDataBusiness] = useState([])
	const [count_orders_business, setCountBusiness] = useState(0)

	const [productDetails, setProductDetails] = useState()

	useEffect(() => {
		const {
			user: { _id, name, email, business },
			dtBusiness,
		} = props
		const refUser = ''
		const db = dtBusiness
		async function fetchData() {
			if (business != null) {
				console.log('OredersFragment', 'Inicio', dtBusiness)
				await props.firebase
					.getLive(
						`/business/${business}/states/isOpen`,
						(data) => {
							if (data.exists()) {
								setIsOpen(data.val())
								setLoading(false)
							} else {
								console.log('NO HAY DATOS: ', db)
								props.firebase.setAdmin(`business/` + business, {
									_id_admin: _id,
									_id: business,
									_name_admin: name,
									email,
									states: {
										verified: false,
										isOpen: false,
										status: true,
									},
								})
								setIsOpen(false)
								setLoading(false)
							}
						},
						(error) => console.log('Error: ', error)
					)
					.then((response) => {
						console.log(response)
					})
					.catch((e) => {
						console.log('Error')
						setLoading(false)
					})

				await props.firebase.bRef
					.child('orders_business/' + business)
					.orderByValue()
					.equalTo(true)
					.on(
						'value',
						async (data) => {
							try {
								const lista = Object.keys(data.val())
								const allDataOrderBusiness = []
								await lista.forEach(async (flt, i, arr) => {
									await props.firebase.bRef.child('orders/' + flt).once(
										'value',
										(dmt) => {
											console.log('DATOL ', dmt.val())
											const data = dmt.val()

											if (data.state) {
												allDataOrderBusiness.push(data)
											}

											if (i === arr.length - 1) {
												setAllDataBusiness(allDataOrderBusiness)
												setCountBusiness(allDataOrderBusiness.length)
												setLoading(false)
											}
										},
										(e) => {
											console.log('error ' + e)
										}
									)
								})
							} catch (e) {
								setAllDataBusiness(null)
								setLoading(false)
								console.log('error ' + e)
							}
						},
						(err) => {
							console.log('error ' + err)
						}
					)
			} else {
				setLoading(false)
			}
		}
		fetchData()
	}, [])

	const changeIsOpen = () => {
		const {
			user: { business },
			firebase: { update },
		} = props
		update(`business/${business}/states/`, { isOpen: !isOpen })
	}

	const formatTime = (timeCreated) => {
		var diff = Date.now() - timeCreated

		if (diff > periods.month) {
			// it was at least a month ago
			return Math.floor(diff / periods.month) + 'm'
		} else if (diff > periods.week) {
			return Math.floor(diff / periods.week) + 'w'
		} else if (diff > periods.day) {
			return Math.floor(diff / periods.day) + 'd'
		} else if (diff > periods.hour) {
			return Math.floor(diff / periods.hour) + 'h'
		} else if (diff > periods.minute) {
			return Math.floor(diff / periods.minute) + 'm'
		}
		return 'Just now'
	}

	const aceptarPedido = (_id, _id_business, _id_user) => {
		var updates = {}
		updates['orders/' + _id + '/state'] = false
		updates['/orders_business/' + _id_business + '/' + _id] = false
		updates['/orders_users/' + _id_user + '/' + _id] = false
		this.props.firebase.bRef.update(updates)
	}

	const clickCardRequest = (item, i) => {
		setProductDetails(item)
	}

	const colorState = isOpen ? '#61B136' : '#FF5335'

	if (loading) {
		return <div>Esto se esta cargando...</div>
	} else {
		if (isOpen == null) {
			return (
				<>El negocio todavia no a sido creado, debes esperar a la confirmacion</>
			)
		} else {
			return (
				<>
					<div style={{ display: 'flex', flexWrap: 'wrap', height: '89vh' }}>
						<div
							className="listOrdersPrt"
							style={{
								overflowY: 'scroll',
								overflowX: 'hidden',
								width: '30vw',
								height: '89vh',
								whiteSpace: 'nowrap',
								background: '#f5f5fa',
							}}>
							<div
								style={{
									background: 'linear-gradient(-025deg, #6717CD, #2871FA)',
									textAlign: 'center',
								}}>
								<img src="./logo.png" width="36px" style={{ padding: 4 }} />
							</div>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}>
								<div style={{ padding: 16 }}>
									<h4>{count_orders_business} PEDIDOS </h4>
									<p>En esperar</p>
								</div>
								<div id="ondisplay">
									<section className="section section--aava">
										<div className="toggle-button toggle-button--aava">
											<input
												id="toggleButton2"
												type="checkbox"
												checked={isOpen}
												onChange={changeIsOpen}
											/>
											<label
												style={{
													background: '#fff',
													color: colorState,
													boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 2px',
												}}
												htmlFor="toggleButton2"
												data-on-text="Open"
												data-off-text="Close"></label>
											<div
												className={
													'toggle-button__icon revert' + (isOpen ? ' isActive' : '')
												}></div>
										</div>
									</section>
								</div>
							</div>
							<div style={{ padding: 16 }}>
								<ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
									<li className="nav-item" role="presentation">
										<a
											className="nav-link active"
											id="pills-home-tab"
											data-toggle="pill"
											href="#pills-home"
											role="tab"
											aria-controls="pills-home"
											aria-selected="true">
											Nuevos
										</a>
									</li>
									<li className="nav-item" role="presentation">
										<a
											className="nav-link"
											id="pills-profile-tab"
											data-toggle="pill"
											href="#pills-profile"
											role="tab"
											aria-controls="pills-profile"
											aria-selected="false">
											En espera
										</a>
									</li>
									<li className="nav-item" role="presentation">
										<a
											className="nav-link"
											id="pills-contact-tab"
											data-toggle="pill"
											href="#pills-contact"
											role="tab"
											aria-controls="pills-contact"
											aria-selected="false">
											Entregados
										</a>
									</li>
								</ul>
								<div className="tab-content" id="pills-tabContent">
									<div
										className="tab-pane fade show active"
										id="pills-home"
										role="tabpanel"
										aria-labelledby="pills-home-tab">
										{allDataOrderBusiness &&
											allDataOrderBusiness.map((item, i) => {
												if (i === 0) {
													console.log('asda', i)
													{
														/* setProductDetails(item) */
													}
												}
												return (
													<div
														onClick={() => clickCardRequest(item, i)}
														key={i}
														className="card"
														style={{
															marginTop: 16,
															width: '100%',
															padding: 16,
															border: 'none',
															boxShadow: '0 1px 2px #0000001a',
															borderRadius: 10,
														}}>
														<div>Titulo</div>
														<p> Direccion </p>

														<p>Total: ${item.total}</p>
														<p>Tiempo: {formatTime(item.date)}</p>
														<p>Items:{item.count_items}</p>
													</div>
												)
											})}
									</div>
									<div
										className="tab-pane fade"
										id="pills-profile"
										role="tabpanel"
										aria-labelledby="pills-profile-tab">
										Sin Datos A
									</div>
									<div
										className="tab-pane fade"
										id="pills-contact"
										role="tabpanel"
										aria-labelledby="pills-contact-tab">
										Sin Datos B
									</div>
								</div>
							</div>
						</div>
						<div style={{ width: '70vw', height: '89vh', overflowY: 'scroll' }}>
							{productDetails ? (
								<>
									<div
										style={{
											padding: 16,
											borderRadius: 16,
											background: '#f5f5fa',
											margin: 16,
										}}>
										<h1>Tienes {count_orders_business} PEDIDOS en ESPERA</h1>
										<p>Total despachados HOY: 3</p>
									</div>
									<div style={{ padding: 16 }}>
										<div>
											<h4>Informacion del pedido</h4>
											<p>ID: {productDetails && productDetails._id}</p>
										</div>
										<div className="row mt-5 mb-5">
											<div className="col-4">
												<p>Hora del pedido</p>
												<p style={{ fontWeight: 'bold' }}>15min</p>
											</div>
											<div className="col-4">
												<p>Calle</p>
												<p style={{ fontWeight: 'bold' }}>C/ Nombre</p>
											</div>
											<div
												onClick={() =>
													alert('Esto es una prueba no puedes acceder al Chat')
												}
												className="bt-chat-pedidos col-4"
												style={{ alignItems: 'center', display: 'flex' }}>
												<div>
													<p>Nombre de usuario</p>
													<p style={{ fontWeight: 'bold' }}>+593999999998</p>
												</div>
												<svg
													style={{
														marginLeft: 16,
														width: 32,
														height: 32,
														background: '#4169e1',
														borderRadius: 999,
														padding: 6,
													}}
													viewBox="0 0 24 24">
													<path
														fill="#fafafa"
														d="M20,20H7A2,2 0 0,1 5,18V8.94L2.23,5.64C2.09,5.47 2,5.24 2,5A1,1 0 0,1 3,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20M8.5,7A0.5,0.5 0 0,0 8,7.5V8.5A0.5,0.5 0 0,0 8.5,9H18.5A0.5,0.5 0 0,0 19,8.5V7.5A0.5,0.5 0 0,0 18.5,7H8.5M8.5,11A0.5,0.5 0 0,0 8,11.5V12.5A0.5,0.5 0 0,0 8.5,13H18.5A0.5,0.5 0 0,0 19,12.5V11.5A0.5,0.5 0 0,0 18.5,11H8.5M8.5,15A0.5,0.5 0 0,0 8,15.5V16.5A0.5,0.5 0 0,0 8.5,17H13.5A0.5,0.5 0 0,0 14,16.5V15.5A0.5,0.5 0 0,0 13.5,15H8.5Z"
													/>
												</svg>
											</div>
										</div>
										{productDetails.list.map((itemE, iE) => {
											return (
												<div
													className="row"
													style={{ borderBottom: 'solid 0.5px #0000001a', padding: 16 }}>
													<div className="col-2">
														<img
															src={itemE.image}
															style={{
																width: 100,
																height: 100,
																objectFit: 'cover',
																borderRadius: 16,
																boxShadow: '0 2px 2px #0000001a',
															}}
														/>
													</div>

													<div
														className="col-8"
														style={{
															display: 'flex',
															flexDirection: 'column',
															justifyContent: 'center',
														}}>
														<p>{itemE.title}</p>
														<p>x{itemE.count}</p>
													</div>
													<hr></hr>
												</div>
											)
										})}
										{productDetails && (
											<div className="mt-4">
												<button
													onClick={() =>
														aceptarPedido(
															productDetails._id,
															productDetails._bid,
															productDetails._uid
														)
													}>
													Aceptar
												</button>
												<button>Rechazar</button>
											</div>
										)}
									</div>
								</>
							) : (
								<> Tu local esta abierto da click sobre un pedido para empezar</>
							)}
						</div>
					</div>
				</>
			)
		}
	}
}

function Wait() {
	return (
		<>
			<div
				className="d-flex justify-center"
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					flexDirection: 'column',
					height: '100%',
				}}>
				<div
					style={{
						width: 100,
						height: 100,
						borderRadius: 1000,
						background: '#cecece',
						position: 'relative',
					}}>
					<img />
					<div
						style={{
							position: 'absolute',
							bottom: 0,
							right: 0,
							width: 32,
							height: 32,
							borderRadius: 1000,
							background: '#cec',
						}}></div>
				</div>
				<h1>Todo listo para ABRIR</h1>
				<button>Vamos</button>
			</div>
		</>
	)
}

export default withFirebase(OrdersFragment)

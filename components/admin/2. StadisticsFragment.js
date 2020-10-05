import React from 'react'

class AdminDashFragment extends React.Component {
	render() {
		return (
			<>
				<div
					className="d-flex justify-content-center align-items-center"
					style={{ flexDirection: 'column', height: '100%', textAlign: 'center' }}>
					<h1>😅</h1>
					<h1>{this.props.name} no disponible</h1>
					<p>Esta pagina no esta disponible para esta prueba</p>
				</div>
			</>
		)
	}
}

export default AdminDashFragment

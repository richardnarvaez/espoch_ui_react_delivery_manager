import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
	return (
		<div className={styles.container}>
			<Head>
				<title>Inicio</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main className={styles.main}>
				<img src="./logo-2.png" width="100px" />
				<h1 className={styles.title}>Prueba de Usabilidad</h1>

				<p className={styles.description}>Administrar productos de Delivery</p>

				<div className={styles.grid}>
					<a href="https://github.com/richardnarvaez/react_delivery_manager_ui" className={styles.card}>
						<h3>Github</h3>
						<p>Proyecto completo</p>
					</a>
					<a href="/admin" className={styles.card}>
						<h3>Pagina Admin &rarr;</h3>
						<p>Prueba</p>
					</a>
				</div>
			</main>
		</div>
	)
}

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
				<h1 className={styles.title}>Prueba de Usabilidad</h1>

				<p className={styles.description}>Administrar productos de Delivery</p>

				<div className={styles.grid}>
					<a href="/admin" className={styles.card}>
						<h3>Pagina de Inico &rarr;</h3>
						<p>Toda la presentacion</p>
					</a>
				</div>
			</main>
		</div>
	)
}

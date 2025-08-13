import Head from 'next/head'
import ImageClassifier from '../components/ImageClassifier'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Will Jangle Eat This?</title>
        <meta name="description" content="Find out if Jangle will eat your food!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Will Jangle Eat This? 🤔
        </h1>
        
        <p className={styles.description}>
          Upload an image to see if Jangle (who eats almost anything except durian) would consume it!
        </p>

        <ImageClassifier />
      </main>
    </div>
  )
}
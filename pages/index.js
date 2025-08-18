import Head from 'next/head'
import ImageClassifier from '../components/ImageClassifier'

export default function Home() {
  return (
    <>
      <Head>
        <title>Will Jangle Eat This?</title>
        <meta name="description" content="Find out if Jangle will eat your food!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container">
        <h1 className="title">Will Jangle Eat This? 🤔</h1>
        <p className="subtitle">
          Upload an image and find out if Jangle would eat it!<br />
          (Spoiler: He'll eat almost anything... except durian)
        </p>

        <ImageClassifier />
      </main>
    </>
  )
}
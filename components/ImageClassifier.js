import { useState } from 'react'
import styles from './ImageClassifier.module.css'

export default function ImageClassifier() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [prediction, setPrediction] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      setError('')
      setPrediction('')
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!selectedFile) {
      setError('Please select an image first!')
      return
    }

    setLoading(true)
    setError('')
    setPrediction('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      // Use localhost:7860 for local development, /api/predict for production
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:7860/api/predict'
        : '/api/predict'
        
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.error) {
        setError(result.error)
      } else {
        setPrediction(result.prediction || result)
      }
    } catch (err) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.uploadSection}>
          <input
            type="file"
            id="imageInput"
            accept="image/*"
            onChange={handleFileChange}
            className={styles.fileInput}
          />
          <label htmlFor="imageInput" className={styles.fileLabel}>
            Choose an image
          </label>
        </div>

        {imagePreview && (
          <div className={styles.preview}>
            <img
              src={imagePreview}
              alt="Preview"
              className={styles.previewImage}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedFile || loading}
          className={styles.submitButton}
        >
          {loading ? 'Analyzing...' : 'Will Jangle Eat This?'}
        </button>
      </form>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {prediction && (
        <div className={styles.result}>
          <h2>Jangle's Verdict:</h2>
          <p className={styles.verdict}>{prediction}</p>
        </div>
      )}
    </div>
  )
}
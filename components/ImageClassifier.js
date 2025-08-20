import { useState, useRef } from 'react'

// The main component for the image classification UI.
export default function ImageClassifier() {
  // --- STATE MANAGEMENT ---
  // Holds the URL for the image input tab.
  const [imageUrl, setImageUrl] = useState('')
  // Holds the File object from the file input.
  const [selectedFile, setSelectedFile] = useState(null)
  // URL for the image preview, generated from either a file or a URL.
  const [previewUrl, setPreviewUrl] = useState(null)
  // Tracks the loading state to show spinners and disable buttons.
  const [loading, setLoading] = useState(false)
  // Stores the prediction result from the API.
  const [result, setResult] = useState(null)
  // Stores any error messages.
  const [error, setError] = useState(null)
  // Manages which tab (file upload or URL) is active.
  const [activeTab, setActiveTab] = useState('file')
  // A reference to the hidden file input element.
  const fileInputRef = useRef(null)

  // --- EVENT HANDLERS ---

  /**
   * Handles the file selection event.
   * It validates the file type and creates a local preview URL.
   * @param {Event} e - The file input change event.
   */
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setSelectedFile(file)
    setResult(null) // Clear previous results
    setError(null)
    
    // Use FileReader to create a local URL for image preview.
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  /**
   * Handles the submission of the file upload form.
   * @param {Event} e - The form submission event.
   */
  const handleFileSubmit = async (e) => {
    e.preventDefault() // Prevent the default form submission behavior.
    if (!selectedFile) {
      setError('Please select an image file')
      return
    }
    await predictImageFromFile(selectedFile)
  }

  /**
   * Handles the submission of the URL input form.
   * @param {Event} e - The form submission event.
   */
  const handleUrlSubmit = async (e) => {
    e.preventDefault() // Prevent the default form submission behavior.
    if (!imageUrl.trim()) {
      setError('Please enter an image URL')
      return
    }

    setResult(null) // Clear previous results
    setError(null)
    setPreviewUrl(imageUrl) // Use the direct URL for preview.
    
    await predictImageFromUrl(imageUrl)
  }

  /**
   * Updates the imageUrl state as the user types in the URL input field.
   * @param {Event} e - The input change event.
   */
  const handleUrlChange = (e) => {
    setImageUrl(e.target.value)
    if (error) setError(null) // Clear error on new input
  }

  // --- API CALLS ---

  /**
   * Sends the uploaded file to the Gradio API for prediction.
   * @param {File} file - The image file to be analyzed.
   */
  const predictImageFromFile = async (file) => {
    setLoading(true)
    setError(null)

    try {
      // Dynamically import the Gradio client library.
      // This helps reduce the initial bundle size of the page.
      const { client } = await import('@gradio/client')
      
      // Connect to the Hugging Face Space API endpoint.
      const app = await client("https://defijangle-will-jangle-eat.hf.space/--replicas/kc6m4/")
      
      // The main prediction call. The file object is sent directly.
      const resultPayload = await app.predict("/predict", [file])
      
      console.log('API response:', resultPayload)

      // Parse the response from the Gradio client.
      if (resultPayload && resultPayload.data && resultPayload.data.length > 0) {
        const prediction = resultPayload.data[0];
        const topLabel = prediction.label;
        let topConfidence = 0;

        // The `Label` component in Gradio returns a `confidences` array.
        // We find the confidence score that matches the top predicted label.
        if (prediction.confidences) {
            const confidenceData = prediction.confidences.find(c => c.label === topLabel);
            if (confidenceData) {
                topConfidence = confidenceData.confidence;
            }
        }

        setResult({ prediction: topLabel, confidence: topConfidence });
      } else {
        throw new Error('Unexpected response format from API')
      }

    } catch (err) {
      console.error('Prediction error:', err)
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetches an image from a URL and sends it to the Gradio API.
   * @param {string} imageUrl - The URL of the image to be analyzed.
   */
  const predictImageFromUrl = async (imageUrl) => {
    setLoading(true)
    setError(null)

    try {
      const { client } = await import('@gradio/client')
      
      // First, fetch the image from the provided URL.
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`)
      }
      // Convert the image response to a Blob, which the API expects.
      const imageBlob = await imageResponse.blob()

      const app = await client("https://defijangle-will-jangle-eat.hf.space/--replicas/kc6m4/")
      
      const resultPayload = await app.predict("/predict", [imageBlob])
      
      console.log('API response:', resultPayload)

      if (resultPayload && resultPayload.data && resultPayload.data.length > 0) {
        const prediction = resultPayload.data[0];
        const topLabel = prediction.label;
        let topConfidence = 0;

        if (prediction.confidences) {
            const confidenceData = prediction.confidences.find(c => c.label === topLabel);
            if (confidenceData) {
                topConfidence = confidenceData.confidence;
            }
        }

        setResult({ prediction: topLabel, confidence: topConfidence });
      } else {
        throw new Error('Unexpected response format from API')
      }

    } catch (err) {
      console.error('Prediction error:', err)
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // --- HELPER FUNCTIONS ---

  /**
   * Determines the display message and CSS class based on the prediction.
   * @param {string} prediction - The predicted label (e.g., 'durian').
   * @returns {object} An object with the message and className.
   */
  const getVerdict = (prediction) => {
    if (!prediction) return null

    switch (prediction) {
      case 'not_durian_edible':
        return {
          message: "Jangle will eat this! 🍽️",
          className: "will-eat"
        }
      case 'durian':
        return {
          message: "Jangle will NOT eat this! 🚫 (It's durian - he hates durian)",
          className: "will-not-eat"
        }
      case 'inedible':
        return {
          message: "Jangle will NOT eat this! 🚫 (Not food)",
          className: "will-not-eat"
        }
      default:
        return {
          message: "Hmm, I'm not sure about this one...",
          className: "will-not-eat"
        }
    }
  }

  // --- RENDER LOGIC ---

  return (
    <div className="upload-area">
      {/* Tab navigation allows switching between upload methods. */}
      <div className="tab-navigation">
        <button 
          type="button"
          className={`tab-button ${activeTab === 'file' ? 'active' : ''}`}
          onClick={() => setActiveTab('file')}
          disabled={loading}
        >
          Upload File
        </button>
        <button 
          type="button"
          className={`tab-button ${activeTab === 'url' ? 'active' : ''}`}
          onClick={() => setActiveTab('url')}
          disabled={loading}
        >
          Image URL
        </button>
      </div>

      {/* Conditionally render the file upload form. */}
      {activeTab === 'file' && (
        <form onSubmit={handleFileSubmit} className="file-form">
          {/* This container holds the custom-styled button and the real, hidden file input. */}
          <div className="file-input-container">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="file-input" // This input is invisible.
              disabled={loading}
            />
            {/* This button is what the user sees. Clicking it programmatically clicks the hidden input. */}
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="file-select-button"
              disabled={loading}
            >
              {selectedFile ? selectedFile.name : 'Choose Image File'}
            </button>
          </div>
          <button type="submit" className="submit-button" disabled={loading || !selectedFile}>
            {loading ? 'Analyzing...' : 'Analyze Image'}
          </button>
        </form>
      )}

      {/* Conditionally render the URL input form. */}
      {activeTab === 'url' && (
        <form onSubmit={handleUrlSubmit} className="url-form">
            <input
              type="url"
              value={imageUrl}
              onChange={handleUrlChange}
              placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
              className="url-input"
              disabled={loading}
            />
            <button type="submit" className="submit-button" disabled={loading || !imageUrl.trim()}>
              {loading ? 'Analyzing...' : 'Analyze Image'}
            </button>
        </form>
      )}
      
      {/* Show the image preview if a URL is available. */}
      {previewUrl && (
        <div className="preview-container" style={{ marginBottom: '1.5rem' }}>
          <img src={previewUrl} alt="Preview" className="preview-image" />
        </div>
      )}

      {/* The status area displays loading spinners, errors, or results. */}
      <div className="status-area">
        {loading && (
          <div className="loading"></div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {result && !loading && (
          <div className="result">
            <div className={`verdict ${getVerdict(result.prediction)?.className}`}>
              {getVerdict(result.prediction)?.message}
            </div>
            {result.confidence > 0 && (
              <div className="confidence">
                Confidence: {Math.round(result.confidence * 100)}%
              </div>
            )}
          </div>
        )}
      </div>

      {/* The test button is only shown on initial load for quick testing. */}
      {!loading && !previewUrl && (
        <button 
          type="button" 
          onClick={() => {
            const busUrl = "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
            setActiveTab('url')
            setImageUrl(busUrl)
            setPreviewUrl(busUrl)
            predictImageFromUrl(busUrl)
          }}
          className="example-button"
          disabled={loading}
        >
          Test with Bus Image
        </button>
      )}
    </div>
  )
}

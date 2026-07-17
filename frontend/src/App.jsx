import "./App.css";
import { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [prediction, setPrediction] = useState("-");
  const [confidence, setConfidence] = useState("-");

  const [loading, setLoading] = useState(false);

  const spiceInfo = {
    Andaliman: {
      description:
        "Andaliman merupakan rempah khas Sumatera Utara yang memiliki cita rasa pedas dan sensasi getir.",
    },

    "Cabe jawa": {
      description:
        "Cabe Jawa adalah rempah berbentuk bulir panjang yang memiliki rasa pedas khas.",
    },

    Cengkeh: {
      description:
        "Cengkeh merupakan bunga kering yang memiliki aroma harum dan rasa hangat.",
    },

    Kapulaga: {
      description:
        "Kapulaga adalah rempah aromatik yang banyak digunakan dalam masakan dan minuman.",
    },

    "Kayu manis": {
      description:
        "Kayu manis berasal dari kulit batang pohon cinnamon yang dikeringkan.",
    },

    Lada: {
      description:
        "Lada merupakan salah satu rempah paling populer di Indonesia dengan rasa pedas khas.",
    },

    Pala: {
      description:
        "Pala merupakan rempah aromatik yang berasal dari biji buah pala.",
    },
  };
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));

      // Reset hasil sebelumnya
      setPrediction("-");
      setConfidence("-");
    }
  };

  const handlePredict = async () => {
    if (!file) {
      alert("Silakan pilih gambar terlebih dahulu.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/predict",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setPrediction(response.data.prediction);
      setConfidence(response.data.confidence);
    } catch (error) {
      console.error(error);
      alert("Gagal melakukan prediksi.");
    } finally {
      setLoading(false);
    }
  };

  const info = spiceInfo[prediction] || {
    description: "-",
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>🌿 Klasifikasi Jenis Rempah Indonesia</h1>
      </div>

      {/* Content */}
      <div className="content">
        {/* LEFT */}
        <div className="left-card">
          <h2>Gambar yang Diupload</h2>

          <div className="image-box">
            {preview ? (
              <img src={preview} alt="preview" />
            ) : (
              <div className="placeholder">Belum ada gambar dipilih</div>
            )}
          </div>

          <input
            id="upload-image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            hidden
          />

          <label htmlFor="upload-image" className="upload-btn">
            📁 {file ? "Ganti Gambar" : "Pilih Gambar"}
          </label>

          <button
            className="predict-btn"
            onClick={handlePredict}
            disabled={!file || loading}
          >
            {loading ? "Memproses..." : "Prediksi"}
          </button>
        </div>

        {/* RIGHT */}
        <div className="right-card">
          <h2>Hasil Klasifikasi</h2>

          <div className="result-item">
            <span className="label">Jenis Rempah</span>

            <h3>{prediction}</h3>
          </div>

          <div className="confidence">
            <span>Confidence</span>
            <h2>{confidence === "-" ? "-" : `${confidence}%`}</h2>
          </div>

          <div className="info-item">
            <span className="label">Deskripsi</span>

            <p>{info.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

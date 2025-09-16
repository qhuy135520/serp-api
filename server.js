const express = require('express')
const axios = require('axios')

const app = express()
const PORT = 8080

// API key SerpApi
const API_KEY =
  '962496bf5176b5b5945d8589b3afca25389a372fa13e9752735f5677363d2e42'

app.get('/getLocation', async (req, res) => {
  const q = req.query.q
  if (!q) return res.status(400).json({ error: "Missing query parameter 'q'" })

  const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(
    q
  )}&api_key=${API_KEY}`

  try {
    const response = await axios.get(url)
    const json = response.data

    let geometry = null

    // Check place_results
    if (json.place_results) {
      if (Array.isArray(json.place_results) && json.place_results.length > 0) {
        const first = json.place_results[0]
        if (first.gps_coordinates) geometry = first.gps_coordinates
      } else if (
        typeof json.place_results === 'object' &&
        json.place_results.gps_coordinates
      ) {
        geometry = json.place_results.gps_coordinates
      }
    }

    // Nếu place_results không có tọa độ, check local_results
    if (!geometry && json.local_results) {
      if (Array.isArray(json.local_results) && json.local_results.length > 0) {
        const first = json.local_results[0]
        if (first.gps_coordinates) geometry = first.gps_coordinates
      } else if (
        typeof json.local_results === 'object' &&
        json.local_results.gps_coordinates
      ) {
        geometry = json.local_results.gps_coordinates
      }
    }

    // Trả kết quả
    if (geometry && geometry.latitude && geometry.longitude) {
      res.json({
        latitude: geometry.latitude,
        longitude: geometry.longitude,
      })
    } else {
      res.json({ error: `Không tìm thấy tọa độ cho query: ${q}` })
    }
  } catch (err) {
    console.error(err)
    res.json({ error: `Lỗi khi lấy tọa độ cho query: ${q}` })
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})

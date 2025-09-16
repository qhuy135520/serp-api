const axios = require('axios')

const API_KEY =
  '962496bf5176b5b5945d8589b3afca25389a372fa13e9752735f5677363d2e42'

exports.handler = async function (event, context) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*', // cho phép gọi từ bất kỳ domain
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }

  // Preflight request (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  const q = event.queryStringParameters?.q
  if (!q)
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing query parameter 'q'" }),
    }

  const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(
    q
  )}&api_key=${API_KEY}`

  try {
    const response = await axios.get(url)
    const json = response.data

    let geometry = null

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

    if (geometry && geometry.latitude && geometry.longitude) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          latitude: geometry.latitude,
          longitude: geometry.longitude,
        }),
      }
    } else {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          error: `Không tìm thấy tọa độ cho query: ${q}`,
        }),
      }
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `Lỗi khi lấy tọa độ cho query: ${q}` }),
    }
  }
}

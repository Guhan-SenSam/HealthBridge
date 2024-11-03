import axios from "axios"

const API_BASE = "https://example.com/api"

export const translateText = async (text: string) => {
  const response = await axios.post(`${API_BASE}/translate`, { text })
  return response.data
}

export const getTranslationResult = async (jobId: string) => {
  const response = await axios.get(`${API_BASE}/translate/result/${jobId}`)
  return response.data
}

import { types, flow } from "mobx-state-tree"
import { translateText, getTranslationResult } from "../services/api"

const Translation = types.model({
  id: types.identifier,
  originalText: types.string,
  translatedText: types.maybe(types.string),
  status: types.optional(types.enumeration(["pending", "completed"]), "pending"),
})

const TranslationStore = types
  .model("TranslationStore", {
    translations: types.array(Translation),
  })
  .actions((self) => ({
    addTranslation(originalText: string, jobId: string) {
      self.translations.push({
        id: jobId,
        originalText,
        translatedText: null,
        status: "pending",
      })
    },
    updateTranslation(id: string, translatedText: string) {
      const translation = self.translations.find((t) => t.id === id)
      if (translation) {
        translation.translatedText = translatedText
        translation.status = "completed"
      }
    },
    fetchTranslationResult: flow(function* (jobId: string) {
      const result = yield getTranslationResult(jobId)
      if (result.status === "completed") {
        self.updateTranslation(jobId, result.result)
      }
    }),
    translateText: flow(function* (text: string) {
      const response = yield translateText(text)
      self.addTranslation(text, response.job_id)
    }),
  }))

export default TranslationStore

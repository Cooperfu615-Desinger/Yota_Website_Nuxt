export type LegalDocumentType = 'terms' | 'privacy' | 'service'

export const useLegalState = () => {
  const showLegalModal = useState('showLegalModal', () => false)
  const legalDocument = useState<LegalDocumentType>('legalDocument', () => 'terms')
  const lastReviewedDocument = useState<LegalDocumentType | null>('lastReviewedDocument', () => null)

  function openLegal(document: LegalDocumentType = 'terms') {
    legalDocument.value = document
    showLegalModal.value = true
  }

  function closeLegal(reviewed = false) {
    if (reviewed) lastReviewedDocument.value = legalDocument.value
    showLegalModal.value = false
  }

  return {
    showLegalModal,
    legalDocument,
    lastReviewedDocument,
    openLegal,
    closeLegal,
  }
}

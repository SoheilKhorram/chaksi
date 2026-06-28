export interface PadelSession {
  id: string
  userId: string
  date: string
  duration: number
  players: string
  type: 'game' | 'training'
  price: number
  extraItems: { name: string; price: number }[]
  totalCost: number
  createdAt: string
  updatedAt: string
}

export interface PadelSettings {
  gamePrice: number
  trainingPrice: number
  sendGameToPartner: boolean
  sendTrainingToPartner: boolean
}

export interface ExtraItemForm {
  name: string
  price: string
}

export interface SharedSession {
  id: string
  senderId: string
  senderName: string
  date: string
  duration: number
  players: string
  type: 'game' | 'training'
  price: number
  extraItems: { name: string; price: number }[]
  createdAt: string
}

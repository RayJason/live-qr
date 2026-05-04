import type { DotType, CornerSquareType, CornerDotType } from 'qr-code-styling'

export type ProductTypeKey = 'STICKER' | 'KEYCHAIN' | 'LUGGAGE_TAG' | 'SNOWBOARD_STICKER' | 'BOARDING_PASS'

export interface QrPreset {
  label: string
  description: string
  icon: string
  dotsType: DotType
  cornerSquareType: CornerSquareType
  cornerDotType: CornerDotType
  dotsColor: string
  cornerColor: string
  backgroundColor: string
  suggestedSize: string
  width: number
  height: number
}

export const productTypeLabels: Record<ProductTypeKey, string> = {
  STICKER: '二维码贴纸',
  KEYCHAIN: '二维码钥匙扣',
  LUGGAGE_TAG: '行李牌',
  SNOWBOARD_STICKER: '滑雪板贴纸',
  BOARDING_PASS: '登机牌挂件',
}

export const qrPresets: Record<ProductTypeKey, QrPreset> = {
  STICKER: {
    label: '二维码贴纸',
    description: '防水耐磨贴纸，适合贴在手机、电脑、相机等设备上',
    icon: '🏷️',
    dotsType: 'rounded',
    cornerSquareType: 'extra-rounded',
    cornerDotType: 'dot',
    dotsColor: '#1a1a2e',
    cornerColor: '#16213e',
    backgroundColor: '#ffffff',
    suggestedSize: '5 × 5 cm',
    width: 300,
    height: 300,
  },
  KEYCHAIN: {
    label: '二维码钥匙扣',
    description: '金属/亚克力钥匙扣，随身携带，适合钥匙、背包挂件',
    icon: '🔑',
    dotsType: 'square',
    cornerSquareType: 'square',
    cornerDotType: 'square',
    dotsColor: '#0f0f0f',
    cornerColor: '#0f0f0f',
    backgroundColor: '#ffffff',
    suggestedSize: '3 × 3 cm',
    width: 250,
    height: 250,
  },
  LUGGAGE_TAG: {
    label: '行李牌',
    description: '大尺寸行李牌，带姓名填写区，适合行李箱、背包',
    icon: '🧳',
    dotsType: 'dots',
    cornerSquareType: 'dot',
    cornerDotType: 'dot',
    dotsColor: '#2d3436',
    cornerColor: '#2d3436',
    backgroundColor: '#f5f6fa',
    suggestedSize: '7 × 5 cm',
    width: 350,
    height: 250,
  },
  SNOWBOARD_STICKER: {
    label: '滑雪板贴纸',
    description: '耐低温、防水防雪，适合滑雪板、雪具等户外装备',
    icon: '🏂',
    dotsType: 'extra-rounded',
    cornerSquareType: 'extra-rounded',
    cornerDotType: 'dot',
    dotsColor: '#e63946',
    cornerColor: '#e63946',
    backgroundColor: '#ffffff',
    suggestedSize: '8 × 8 cm',
    width: 350,
    height: 350,
  },
  BOARDING_PASS: {
    label: '登机牌挂件',
    description: '登机牌风格设计，适合挂在行李箱把手、护照夹上',
    icon: '✈️',
    dotsType: 'rounded',
    cornerSquareType: 'extra-rounded',
    cornerDotType: 'dot',
    dotsColor: '#1d3557',
    cornerColor: '#1d3557',
    backgroundColor: '#f1faee',
    suggestedSize: '6 × 4 cm',
    width: 300,
    height: 200,
  },
}

export const sizeOptions = [
  { value: '3x3', label: '3 × 3 cm' },
  { value: '5x5', label: '5 × 5 cm' },
  { value: '6x4', label: '6 × 4 cm' },
  { value: '7x5', label: '7 × 5 cm' },
  { value: '8x8', label: '8 × 8 cm' },
]

export interface Position {
  id: string;
  label: string;
  x: number; // 0-100 (percentage across width)
  y: number; // 0-100 (percentage down height)
  allowedPositions: string[]; // What player positions can fill this role
}

export interface FormationLayout {
  id: string;
  name: string;
  positions: Position[];
}

export const FORMATIONS: Record<string, FormationLayout> = {
  '4-3-3': {
    id: '4-3-3',
    name: '4-3-3 Standard',
    positions: [
      { id: 'GK',  label: 'GK',  x: 50, y: 88, allowedPositions: ['Goalkeeper'] },
      { id: 'LB',  label: 'LB',  x: 15, y: 70, allowedPositions: ['Defender'] },
      { id: 'CB1', label: 'CB',  x: 37, y: 74, allowedPositions: ['Defender'] },
      { id: 'CB2', label: 'CB',  x: 63, y: 74, allowedPositions: ['Defender'] },
      { id: 'RB',  label: 'RB',  x: 85, y: 70, allowedPositions: ['Defender'] },
      { id: 'CDM', label: 'CDM', x: 50, y: 57, allowedPositions: ['Midfielder'] },
      { id: 'CM1', label: 'CM',  x: 30, y: 48, allowedPositions: ['Midfielder'] },
      { id: 'CM2', label: 'CM',  x: 70, y: 48, allowedPositions: ['Midfielder'] },
      { id: 'LW',  label: 'LW',  x: 18, y: 25, allowedPositions: ['Winger', 'Forward'] },
      { id: 'RW',  label: 'RW',  x: 82, y: 25, allowedPositions: ['Winger', 'Forward'] },
      { id: 'ST',  label: 'ST',  x: 50, y: 13, allowedPositions: ['Forward'] },
    ]
  },
  '4-4-2': {
    id: '4-4-2',
    name: '4-4-2 Traditional',
    positions: [
      { id: 'GK',  label: 'GK',  x: 50, y: 88, allowedPositions: ['Goalkeeper'] },
      { id: 'LB',  label: 'LB',  x: 15, y: 70, allowedPositions: ['Defender'] },
      { id: 'CB1', label: 'CB',  x: 38, y: 74, allowedPositions: ['Defender'] },
      { id: 'CB2', label: 'CB',  x: 62, y: 74, allowedPositions: ['Defender'] },
      { id: 'RB',  label: 'RB',  x: 85, y: 70, allowedPositions: ['Defender'] },
      { id: 'LM',  label: 'LM',  x: 13, y: 47, allowedPositions: ['Midfielder', 'Winger'] },
      { id: 'CM1', label: 'CM',  x: 37, y: 50, allowedPositions: ['Midfielder'] },
      { id: 'CM2', label: 'CM',  x: 63, y: 50, allowedPositions: ['Midfielder'] },
      { id: 'RM',  label: 'RM',  x: 87, y: 47, allowedPositions: ['Midfielder', 'Winger'] },
      { id: 'ST1', label: 'ST',  x: 38, y: 16, allowedPositions: ['Forward'] },
      { id: 'ST2', label: 'ST',  x: 62, y: 16, allowedPositions: ['Forward'] },
    ]
  },
  '3-5-2': {
    id: '3-5-2',
    name: '3-5-2 Tactical',
    positions: [
      { id: 'GK',   label: 'GK',  x: 50, y: 88, allowedPositions: ['Goalkeeper'] },
      { id: 'CB1',  label: 'CB',  x: 25, y: 73, allowedPositions: ['Defender'] },
      { id: 'CB2',  label: 'CB',  x: 50, y: 76, allowedPositions: ['Defender'] },
      { id: 'CB3',  label: 'CB',  x: 75, y: 73, allowedPositions: ['Defender'] },
      { id: 'LWB',  label: 'LWB', x: 10, y: 47, allowedPositions: ['Defender', 'Winger'] },
      { id: 'CDM1', label: 'CDM', x: 35, y: 58, allowedPositions: ['Midfielder'] },
      { id: 'CAM',  label: 'CAM', x: 50, y: 40, allowedPositions: ['Midfielder'] },
      { id: 'CDM2', label: 'CDM', x: 65, y: 58, allowedPositions: ['Midfielder'] },
      { id: 'RWB',  label: 'RWB', x: 90, y: 47, allowedPositions: ['Defender', 'Winger'] },
      { id: 'ST1',  label: 'ST',  x: 38, y: 16, allowedPositions: ['Forward'] },
      { id: 'ST2',  label: 'ST',  x: 62, y: 16, allowedPositions: ['Forward'] },
    ]
  },
  '4-2-3-1': {
    id: '4-2-3-1',
    name: '4-2-3-1 Modern',
    positions: [
      { id: 'GK',  label: 'GK',  x: 50, y: 88, allowedPositions: ['Goalkeeper'] },
      { id: 'LB',  label: 'LB',  x: 15, y: 70, allowedPositions: ['Defender'] },
      { id: 'CB1', label: 'CB',  x: 37, y: 74, allowedPositions: ['Defender'] },
      { id: 'CB2', label: 'CB',  x: 63, y: 74, allowedPositions: ['Defender'] },
      { id: 'RB',  label: 'RB',  x: 85, y: 70, allowedPositions: ['Defender'] },
      { id: 'CDM1',label: 'CDM', x: 37, y: 57, allowedPositions: ['Midfielder'] },
      { id: 'CDM2',label: 'CDM', x: 63, y: 57, allowedPositions: ['Midfielder'] },
      { id: 'LAM', label: 'LAM', x: 18, y: 35, allowedPositions: ['Midfielder', 'Winger'] },
      { id: 'CAM', label: 'CAM', x: 50, y: 33, allowedPositions: ['Midfielder'] },
      { id: 'RAM', label: 'RAM', x: 82, y: 35, allowedPositions: ['Midfielder', 'Winger'] },
      { id: 'ST',  label: 'ST',  x: 50, y: 13, allowedPositions: ['Forward'] },
    ]
  },
  '3-4-3': {
    id: '3-4-3',
    name: '3-4-3 Attack',
    positions: [
      { id: 'GK',  label: 'GK',  x: 50, y: 88, allowedPositions: ['Goalkeeper'] },
      { id: 'CB1', label: 'CB',  x: 25, y: 73, allowedPositions: ['Defender'] },
      { id: 'CB2', label: 'CB',  x: 50, y: 76, allowedPositions: ['Defender'] },
      { id: 'CB3', label: 'CB',  x: 75, y: 73, allowedPositions: ['Defender'] },
      { id: 'LM',  label: 'LM',  x: 13, y: 50, allowedPositions: ['Midfielder', 'Winger'] },
      { id: 'CM1', label: 'CM',  x: 38, y: 52, allowedPositions: ['Midfielder'] },
      { id: 'CM2', label: 'CM',  x: 62, y: 52, allowedPositions: ['Midfielder'] },
      { id: 'RM',  label: 'RM',  x: 87, y: 50, allowedPositions: ['Midfielder', 'Winger'] },
      { id: 'LW',  label: 'LW',  x: 18, y: 20, allowedPositions: ['Winger', 'Forward'] },
      { id: 'ST',  label: 'ST',  x: 50, y: 13, allowedPositions: ['Forward'] },
      { id: 'RW',  label: 'RW',  x: 82, y: 20, allowedPositions: ['Winger', 'Forward'] },
    ]
  },
  '4-5-1': {
    id: '4-5-1',
    name: '4-5-1 Defensive',
    positions: [
      { id: 'GK',  label: 'GK',  x: 50, y: 88, allowedPositions: ['Goalkeeper'] },
      { id: 'LB',  label: 'LB',  x: 13, y: 70, allowedPositions: ['Defender'] },
      { id: 'CB1', label: 'CB',  x: 37, y: 74, allowedPositions: ['Defender'] },
      { id: 'CB2', label: 'CB',  x: 63, y: 74, allowedPositions: ['Defender'] },
      { id: 'RB',  label: 'RB',  x: 87, y: 70, allowedPositions: ['Defender'] },
      { id: 'LM',  label: 'LM',  x: 10, y: 48, allowedPositions: ['Midfielder', 'Winger'] },
      { id: 'CM1', label: 'CM',  x: 30, y: 52, allowedPositions: ['Midfielder'] },
      { id: 'CM2', label: 'CM',  x: 50, y: 50, allowedPositions: ['Midfielder'] },
      { id: 'CM3', label: 'CM',  x: 70, y: 52, allowedPositions: ['Midfielder'] },
      { id: 'RM',  label: 'RM',  x: 90, y: 48, allowedPositions: ['Midfielder', 'Winger'] },
      { id: 'ST',  label: 'ST',  x: 50, y: 13, allowedPositions: ['Forward'] },
    ]
  },
  '5-4-1': {
    id: '5-4-1',
    name: '5-4-1 Ultra Defensive',
    positions: [
      { id: 'GK',  label: 'GK',  x: 50, y: 88, allowedPositions: ['Goalkeeper'] },
      { id: 'LWB', label: 'LWB', x: 8,  y: 67, allowedPositions: ['Defender', 'Winger'] },
      { id: 'CB1', label: 'CB',  x: 28, y: 72, allowedPositions: ['Defender'] },
      { id: 'CB2', label: 'CB',  x: 50, y: 75, allowedPositions: ['Defender'] },
      { id: 'CB3', label: 'CB',  x: 72, y: 72, allowedPositions: ['Defender'] },
      { id: 'RWB', label: 'RWB', x: 92, y: 67, allowedPositions: ['Defender', 'Winger'] },
      { id: 'LM',  label: 'LM',  x: 15, y: 48, allowedPositions: ['Midfielder'] },
      { id: 'CM1', label: 'CM',  x: 38, y: 52, allowedPositions: ['Midfielder'] },
      { id: 'CM2', label: 'CM',  x: 62, y: 52, allowedPositions: ['Midfielder'] },
      { id: 'RM',  label: 'RM',  x: 85, y: 48, allowedPositions: ['Midfielder'] },
      { id: 'ST',  label: 'ST',  x: 50, y: 13, allowedPositions: ['Forward'] },
    ]
  },
};

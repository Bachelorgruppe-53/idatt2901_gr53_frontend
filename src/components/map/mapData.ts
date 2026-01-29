export interface MapLocation {
    id: string
    latitude: number;
    longitude: number;
    title: string;
    description: string;
    color?: string;
}

export const locations: MapLocation[] = [
    {
        id: '1',
        latitude: 63.420128,
        longitude: 10.387826,
        title: 'Sykepleier',
        description: 'Scann stolpen i 2. etasje for å låse opp yrket',
    },
    {
        id: '2',
        latitude: 63.421,
        longitude: 10.387826,
        title: 'Sykepleier',
        description: 'Scann stolpen i 2. etasje for å låse opp yrket',
        color: 'purple',
    },
];

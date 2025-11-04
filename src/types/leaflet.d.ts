declare module 'leaflet' {
  export interface Map {
    remove: () => void;
  }
  export function map(element: HTMLElement, options?: unknown): Map;
  export function tileLayer(urlTemplate: string, options?: unknown): { addTo: (map: Map) => void };
  export function marker(position: [number, number]): { addTo: (map: Map) => void };
}

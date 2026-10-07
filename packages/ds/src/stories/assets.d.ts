// Ảnh demo import trong stories (Vite trả URL)
declare module '*.jpg' { const src: string; export default src; }
declare module '*.png' { const src: string; export default src; }

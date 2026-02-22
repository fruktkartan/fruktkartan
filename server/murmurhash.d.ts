declare module 'murmurhash' {
  const murmurhash: {
    v3(key: string, seed?: number): number
  }
  export default murmurhash
}

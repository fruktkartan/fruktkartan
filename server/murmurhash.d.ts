declare module "murmurhash" {
  const murmurhash: {
    v3(_key: string, _seed?: number): number
  }
  export default murmurhash
}

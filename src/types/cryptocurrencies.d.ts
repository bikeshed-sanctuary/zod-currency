declare module 'cryptocurrencies' {
  const cryptocurrencies: Record<string, string>;
  const symbols: string[];
  
  export { symbols };
  export default cryptocurrencies;
} 
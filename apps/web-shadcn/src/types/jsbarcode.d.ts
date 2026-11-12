declare module 'jsbarcode' {
  function JsBarcode(
    element: Element | string,
    text: string,
    options?: Record<string, any>,
  ): void;

  export default JsBarcode;
}

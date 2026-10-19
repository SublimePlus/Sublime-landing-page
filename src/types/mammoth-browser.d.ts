// mammoth's browser bundle has the same API as the Node entry point.
declare module "mammoth/mammoth.browser" {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- mammoth types use `export =`
  import mammoth = require("mammoth");
  export = mammoth;
}

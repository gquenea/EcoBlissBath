declare namespace Cypress {
  interface Chainable<Subject = any> {
    getByDataCy(selector: string, ...args: any[]): Chainable<Subject>;
  }
}


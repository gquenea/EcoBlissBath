describe('Smoke tests', () => {
  it('On login page : should display email and password field and a button to login', () => {
    cy.visit('http://localhost:8080/#/login');
    cy.getByDataCy('login-input-username').should('be.visible');
    cy.getByDataCy('login-input-password').should('be.visible');
    cy.getByDataCy('login-submit').should('be.visible');
  });

  describe('When logged in', () => {
    before(() => {
      cy.visit('http://localhost:8080/#/login');
      cy.getByDataCy('login-input-username').type('test2@test.fr');
      cy.getByDataCy('login-input-password').type('testtest');
      cy.getByDataCy('login-submit').click();
    });

    it('On product page, should display add to cart button if user is logged and should display the stock detail', () => {
      const randomProductId = Math.floor(Math.random() * 8) + 3;
      cy.visit(`http://localhost:8080/#/products/${randomProductId}`);
      cy.getByDataCy('detail-product-add').should('be.visible');
      cy.getByDataCy('detail-product-stock').should('be.visible');
    });
  });
});

describe('Connexion', () => {
  it('connexion flow', () => {
    cy.visit('http://localhost:8080/#');
    cy.getByDataCy('nav-link-login').click();
    cy.url().should('include', '/login');
    cy.getByDataCy('login-form').should('be.visible');
    cy.getByDataCy('login-input-username').type('test2@test.fr');
    cy.getByDataCy('login-input-password').type('testtest');
    cy.getByDataCy('login-submit').click();

    cy.wait(500);
    cy.window().then((window) => {
      expect(window.localStorage.getItem('user')).to.exist;
    });
    cy.getByDataCy('nav-link-cart').should('be.visible');
  });
});

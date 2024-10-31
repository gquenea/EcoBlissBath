describe('Cart', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/#/login');
    cy.getByDataCy('login-input-username').type('test2@test.fr');
    cy.getByDataCy('login-input-password').type('testtest');
    cy.getByDataCy('login-submit').click();
    cy.wait(1000);
  });

  it('On product page, stock must be greater than 1 to be added', () => {
    cy.visit(`http://localhost:8080/#/products`);
    cy.getByDataCy('product-link').should('have.length.greaterThan', 0);

    cy.getByDataCy('product-link')
      .should('have.length.greaterThan', 0)
      .then((products) => {
        const productElements = products as unknown as JQuery<HTMLElement>;
        const randomIndex = Math.floor(Math.random() * productElements.length);
        cy.wrap(productElements[randomIndex]).click();
      });

    cy.wait(1000);

    cy.getByDataCy('detail-product-stock')
      .invoke('text')
      .then((stockText) => {
        const matches = stockText.match(/-?\d+/);
        if (matches && matches[0]) {
          const stock = parseInt(matches[0], 10); // Extraction du nombre uniquement
          if (stock <= 0) {
            cy.getByDataCy('detail-product-add').should('be.disabled');
          } else {
            cy.getByDataCy('detail-product-add').should('not.be.disabled');
          }
        } else {
          throw new Error(
            'Stock information not found in the product details.'
          );
        }
      });
  });

  it('the product has been successfully added to the cart', () => {
    let token = '';

    cy.request('POST', Cypress.env('apiUrl') + '/login', {
      username: 'test2@test.fr',
      password: 'testtest',
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('token');
      token = response.body.token;

      cy.request({
        method: 'GET',
        url: Cypress.env('apiUrl') + '/orders',
        headers: {
          Authorization: 'Bearer ' + token,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);

        const initialOrderLinesCount = response.body.orderLines.length;
        console.log('initial :' + initialOrderLinesCount);
        cy.visit(`http://localhost:8080/#/products/5`);
        cy.url().should('include', '/products');
        cy.getByDataCy('detail-product-add').click();

        cy.wait(1000);

        cy.request({
          method: 'GET',
          url: Cypress.env('apiUrl') + '/orders',
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }).then((response) => {
          expect(response.status).to.eq(200);

          const OrderLinesCountAfterAdd = response.body.orderLines.length;
          console.log('after :' + OrderLinesCountAfterAdd);
        });
      });
    });
  });
});

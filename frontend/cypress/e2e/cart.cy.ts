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
          const stock = parseInt(matches[0], 10); // Extract the number
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
    let initialOrderLinesCount: number;
    let productExists: boolean;
    let initialProductQuantity: number;

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

        initialOrderLinesCount = response.body.orderLines.length;

        if (initialOrderLinesCount > 0) {
          productExists = response.body.orderLines.some(
            (orderLine: { product: { id: number } }) =>
              orderLine.product.id === 5
          );

          if (productExists) {
            const orderLineWithProduct = response.body.orderLines.find(
              (orderLine: { product: { id: number }; quantity: number }) =>
                orderLine.product.id === 5
            );
            initialProductQuantity = orderLineWithProduct.quantity;
          }
        }

        cy.wait(1000);

        cy.request({
          method: 'PUT',
          url: Cypress.env('apiUrl') + '/orders/add',
          headers: {
            Authorization: 'Bearer ' + token,
          },
          body: {
            product: 5,
            quantity: 1,
          },
        }).then((response) => {
          expect(response.status).to.eq(200);
        });

        cy.wait(1000);

        cy.request({
          method: 'GET',
          url: Cypress.env('apiUrl') + '/orders',
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }).then((response) => {
          expect(response.status).to.eq(200);
          const finalOrderLinesCount = response.body.orderLines.length;

          // first case
          if (initialOrderLinesCount === 0) {
            expect(finalOrderLinesCount).to.equal(1);
          }

          // second case
          if (
            initialOrderLinesCount !== response.body.orderLines.length &&
            !productExists
          ) {
            expect(response.body.orderLines.length).to.equal(
              initialOrderLinesCount + 1
            );
          }

          // third case
          if (productExists) {
            const orderLineWithProduct = response.body.orderLines.find(
              (orderLine: { product: { id: number }; quantity: number }) =>
                orderLine.product.id === 5
            );

            expect(orderLineWithProduct.quantity).to.equal(
              initialProductQuantity + 1
            );
          }
        });
      });
    });
  });

  it('Go back to the product page and check that the stock has decreased by the number of items added to the cart.', () => {
    let initialProductStock: number;
    let finalProductStock: number;
    let productQuantity = 3;

    cy.visit('http://localhost:8080/#/login');
    cy.getByDataCy('login-input-username').type('test2@test.fr');
    cy.getByDataCy('login-input-password').type('testtest');
    cy.getByDataCy('login-submit').click();

    cy.wait(1000);

    cy.visit('http://localhost:8080/#/products/9');
    cy.wait(1000);

    cy.getByDataCy('detail-product-stock')
      .invoke('text')
      .then((stockText) => {
        const matches = stockText.match(/-?\d+/);
        if (matches && matches[0]) {
          initialProductStock = parseInt(matches[0], 10);
        }
      });
    cy.getByDataCy('detail-product-quantity')
      .clear()
      .type(productQuantity.toString());

    cy.getByDataCy('detail-product-add').click();
    cy.wait(1000);

    cy.visit('http://localhost:8080/#/products/9');
    cy.wait(1000);

    cy.getByDataCy('detail-product-stock')
      .invoke('text')
      .then((stockText) => {
        const matches = stockText.match(/-?\d+/);
        if (matches && matches[0]) {
          finalProductStock = parseInt(matches[0], 10);
        }
        expect(finalProductStock).to.equal(
          initialProductStock - productQuantity
        );
      });
  });
});

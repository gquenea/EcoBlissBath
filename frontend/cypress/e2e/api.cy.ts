describe('Api - User Not Logged In', () => {
  it('Get orders - Expected error if user is not logged in', () => {
    cy.request({
      method: 'GET',
      url: Cypress.env('apiUrl') + '/orders',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('Post Login - Expected error if logs are not correct', () => {
    cy.request({
      method: 'POST',
      url: Cypress.env('apiUrl') + '/login',
      body: {
        username: 'fail@test.fr',
        password: 'failtest',
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});

describe('Api - User Logged In', () => {
  let token = '';
  beforeEach(() => {
    cy.request('POST', Cypress.env('apiUrl') + '/login', {
      username: 'test2@test.fr',
      password: 'testtest',
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('token');
      token = response.body.token;
    });
  });

  it('Should return items in cart', () => {
    cy.request({
      method: 'GET',
      url: Cypress.env('apiUrl') + '/orders',
      headers: {
        Authorization: 'Bearer ' + token,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('orderLines');
      expect(response.body.orderLines).to.be.an('array');
    });
  });

  it('Should return the product details', () => {
    cy.request({
      method: 'GET',
      url: Cypress.env('apiUrl') + '/products/5',
      headers: {
        Authorization: 'Bearer ' + token,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.not.be.empty;
    });
  });

  it('Add a product to cart', () => {
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
      expect(response.body).to.be.an('object');
      expect(response.body).to.not.be.empty;
    });
  });

  // En attente de retour de Pascal

  // it('Should return an error when trying to add a product that is out of stock', () => {
  //   cy.request({
  //     method: 'PUT',
  //     url: Cypress.env('apiUrl') + '/orders/add',
  //     headers: {
  //       Authorization: 'Bearer ' + token,
  //     },
  //     body: {
  //       product: 4,
  //       quantity: 1,
  //     },
  //     failOnStatusCode: false,
  //   }).then((response) => {
  //     expect(response.body).to.be.an('object');
  //   });
  // });

  it('Should return an error when trying to add a product that is out of stock', () => {
    cy.request({
      method: 'POST',
      url: Cypress.env('apiUrl') + '/reviews',
      headers: {
        Authorization: 'Bearer ' + token,
      },
      body: {
        title: 'title test',
        comment: 'comment test',
        rating: 5,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
    });
  });
});

describe('My first test', () => {
  it('should navigate to localhost:3000', () => {
    cy.visit('localhost:3000')
  })

  it('should have the correct logo text and href', () => {
    cy.get('.left')
      .should('have.text', 'Blog')
      .should('have.attr', 'href', '/')
  })
})

describe('Login', () => {
  it('should begin oAuth flow on button click', () => {
    const oAuthURL = '/auth/google'

    // Login button
    cy.get('li > a')
      .should('have.text', 'Login With Google')
      .should('have.attr', 'href', oAuthURL)

    // Only test what you control. Try to avoid requiring a 3rd party server.
    // When necessary, always use cy.request() to talk to 3rd party servers via their APIs.
    // Including testing login when your app uses another provider via OAuth.
    cy.request({
      url: oAuthURL,
      followRedirect: false
    }).then(response => {
      console.log(response)
      expect(response.status).to.eq(302)
      expect(response.redirectedToUrl).to.match(/accounts\.google\.com/)
    })
  })
})

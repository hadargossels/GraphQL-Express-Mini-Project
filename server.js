const express = require('express')
const expressGraphQl = require('express-graphql').graphqlHTTP
const {
GraphQLSchema, //import data schema
GraphQLObjectType, //import object type that allow us to create dynamic object full of different types
GraphQLString, //import graphql string
GraphQLList,
GraphQLInt,
GraphQLNonNull
} = require('graphql')
const app = express()

//sample data, can be replaced with data from database

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const BookType = new GraphQLObjectType({ //custom object that we pass to be our type
    name: 'Book',
    description: 'This represnts a book written by an author',
    fields: () => ({ //fields is a function that returns an object. it cannot be an object because we are
        //reffering AuthorType and BookType in each other' the function helps us to get everything defined before we call it
        id: {type: GraphQLNonNull(GraphQLInt)}, //no need of resolve because the id exist in the object property
        name: {type: GraphQLNonNull(GraphQLString)}, //wrap everything in a non-null object to keep it from being empty
        authorId: {type: GraphQLNonNull(GraphQLInt)},
        author: {type: AuthorType,
        resolve: (book) => {     
            return authors.find(author => author.id === book.authorId) //the parent is the book type
        }}
    }) 
})

const AuthorType = new GraphQLObjectType({ //custom object that we pass to be our type
    name: 'Author',
    description: 'This represnts the authors',
    fields: () => ({ //create fields function that will return the different fields we want
        id: {type: GraphQLNonNull(GraphQLInt)}, //no need of resolve because the id exist in the object property
        name: {type: GraphQLNonNull(GraphQLString)}, //wrap everything in a non-null object to keep it from being empty
        books: {type: new GraphQLList(BookType),
        resolve: (author) => {book => book.authorId === author.id} //resolve function tells graphql where to get the info from
        }
    }) 
})



const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({ 
        book: {
            type: BookType, //returning a single booktype
            description: 'a single book',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => books.find((book) => book.id === args.id) //returning the books object
        },
        books: {
            type: new GraphQLList(BookType), //adding custom object type
            description: 'List of books',
            resolve: () => books //returning the books object
        },
        authors: {
            type: new GraphQLList(AuthorType), //adding custom object type
            description: 'List of authors',
            resolve: () => authors //returning the authors object
        },
        author: {
            type: AuthorType, 
            description: 'a single author',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => authors.find((author) => author.id === args.id) 
        }
    })
})

// create mutation type
const RootMutationType = new GraphQLObjectType({
    name: "Mutation",
    description: "Root Mutation",
    fields: () => ({
        addBook: {
            type: BookType,
            description: "add book",
            args: {
                name: {type: GraphQLNonNull(GraphQLString) },
                authorId: {type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: "add author",
            args: {
                name: {type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const author = {
                    id: authors.length + 1,
                    name: args.name
                }
                authors.push(author)
                return author
            }
        }
    })

})

// create schema
const schema = new GraphQLSchema({
    query: RootQueryType, //query get info from root
    mutation: RootMutationType // mutation is the graphql equivalent to post, put, del in rest api
})

//add route '/graphql'
app.use('/graphql', expressGraphQl({
    schema: schema, //get the schema we built
    graphiql: true //create user interface to access graphql server
}))

//connect to 5000 port, console messege when connected
app.listen(5000., () => {console.log('server is running')})
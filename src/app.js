const uuidv4 = require('uuid/v4')

const express = require('express')

const app = express()
app.use(express.json())

// Your code starts here.
// Placeholders for all requests are provided for your convenience.

app.get('/', (req, res) => {
    // http://localhost:3000/
    res.send('hola mundo')
})

let Usuarios = []
app.post('/api/user', (req, res) => {
    if (!req.body) {
        return res.status(400).send('The body is empty!')
    }

    if (!req.body.user_id || !req.body.login || !req.body.password) {
        return res.status(400).send('There are missing parameters!')
    }

    try {
        const Usuario = {
            user_id: req.body.user_id,
            login: req.body.login,
            password: req.body.password,
            token: uuidv4()
        }

        console.log(`created user: `, Usuario)

        Usuarios.push(Usuario)
        console.log(`all the users: `, Usuarios)

        return res.status(201).send()
    } catch (error) {
        console.error(`error: ${error}`)
        // return res.status(500).send(error) //server error
    }

})

app.post('/api/authenticate', (req, res) => {
    if (!req.body) {
        return res.status(400).send('The body is empty!')
    }

    if (!req.body.login || !req.body.password) {
        return res.status(400).send('There are missing parameters!')
    }

    try {
        const found = Usuarios.find(usuario => usuario.login == req.body.login)
        console.log(`Usuario: `, found)

        if (!found) {
            return res.status(404).send('There is no user with that login name!')
        }
        console.log(`authenticated: `, found)

        console.log(`authenticated password: `, found.password)
        if (found.password !== req.body.password) {
            return res.status(401).send('Invalid password!')
        }

        const result = {
            "token": found.token
        }

        return res.status(200).send(result)
    } catch (error) {
        console.error(`error: ${error}`)
        // return res.status(500).send(error) //server error
    }
})

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        console.log('token:', token)

        const found = Usuarios.find(usuario => usuario.token == token)
        console.log(`found: `, found)

        if (!found) {
            throw new Error()
        }

        req.token = token //para despues poder hacer el logout
        req.user_id = found.user_id //para guardar en el articulo
        next()
    } catch (error) {
        return res.status(401).send('Invalid Token')
    }
}


app.post('/api/logout', auth, (req, res) => {
    //destroy the token
    Usuarios = Usuarios.filter((usuario) => usuario.token !== req.token)

    console.log(`all the users left: `, Usuarios)

    return res.status(200).send()
})


let Articulos = []
app.post('/api/articles', auth, (req, res) => {
    if (!req.body) {
        return res.status(400).send('The body is empty!')
    }

    if (!req.body.article_id || !req.body.title || !req.body.content || !req.body.visibility) {
        return res.status(400).send('There are missing parameters!')
    }

    try {
        const Articulo = {
            article_id: req.body.article_id,
            title: req.body.title,
            content: req.body.content,
            visibility: req.body.visibility,
            user_id: req.user_id
        }

        console.log(`created article: `, Articulo)

        Articulos.push(Articulo)
        console.log(`all the articles: `, Articulos)

        return res.status(201).send()
    } catch (error) {
        console.error(`error: ${error}`)
        // return res.status(500).send(error) //server error
    }
})

app.get('/api/articles', (req, res) => {
    try {
        console.log(`all the articles: `, Articulos)


        const result = []
        result.push(Articulos.filter((articulo) => articulo.visibility == 'public'))
        console.log(`result: `, result)


        // console.log(`req.header('Authorization').replace('Bearer ', '')`, req.header('Authorization').replace('Bearer ', ''))

        if (req.header('Authorization').replace('Bearer ', '') != 'null') {
            const token = req.header('Authorization').replace('Bearer ', '')
            console.log('token:', token)

            const found = Usuarios.find(usuario => usuario.token == token)
            console.log(`found: `, found)

            if (found) {
                result.push(Articulos.filter((articulo) => articulo.visibility == 'logged_in'))
            }

            //para traer los privados de ese usuario
            result.push(Articulos.filter((articulo) => (articulo.visibility == 'private' && articulo.user_id == found.user_id)))
        }


        return res.status(200).send(result)
    } catch (error) {
        console.error(`error: ${error}`)
        // return res.status(500).send(error) //server error
    }
})

const insertar_datos_de_ejemplo = () => {
    console.log('*** INICIO: datos de ejemplo *** ')

    const Usuario = {
        user_id: '123456',
        login: 'login',
        password: 'password',
        token: uuidv4()
    }
    Usuarios.push(Usuario)
    console.log(`all the users: `, Usuarios)


    const algunos_articulos = [{
        article_id: 'article_id',
        title: 'title',
        content: 'content',
        visibility: 'public',
        user_id: '123456'
    }, {
        article_id: 'article_id',
        title: 'title',
        content: 'content',
        visibility: 'logged_in',
        user_id: '123456'
    }, {
        article_id: 'article_id',
        title: 'title',
        content: 'content',
        visibility: 'private',
        user_id: '123456'
    }]

    Articulos.push(algunos_articulos[0])
    Articulos.push(algunos_articulos[1])
    Articulos.push(algunos_articulos[2])

    console.log(`all the articles: `, Articulos)


    console.log('*** FIN: datos de ejemplo *** ')
}


exports.default = app.listen(process.env.HTTP_PORT || 3000, () => {
    console.log(`Server listening at http://localhost:3000/`)

    insertar_datos_de_ejemplo()
})
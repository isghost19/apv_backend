import generarJWT from "../helpers/generarJWT.js";
import Veterinario from "../models/Veterinario.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/EmailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";



const registrar = async(req, res) => {

    const { email, password, nombre } = req.body;

    // Prevenir si hay usuarios duplicados+
    const existeUsuario = await Veterinario.findOne({email})

    if(existeUsuario) {
        const error = new Error('Usuario ya existe');
        return res.status(400).json({msg: error.message})
    }


    try {
        // Guardar un nuevo veterinario
        const veterinario = new Veterinario(req.body);
        const veterinarioGuardado = await veterinario.save();

        // Enviar el email
        emailRegistro({
            email,
            token: veterinarioGuardado.token,
            nombre
        });

        res.json(veterinarioGuardado);

    } catch (error) {
        console.log(error);

    }
    
}

const confirmar = async(req, res) => {

    const {token} = req.params;

    const usuarioConfirmar = await Veterinario.findOne({token})


    console.log(usuarioConfirmar);

    if(!usuarioConfirmar) {
        const error = new Error('Token no valido');
        return res.status(404).json({msg: error.message});
    }

    try {
        
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        await usuarioConfirmar.save()

        res.json({msg: 'Confirmando Confirmado correctamente'})
    } catch (error) {
        console.log(error)
    }

}

const autenticar = async(req, res) => {

    const {email, password} = req.body
    // Comprobar si el usuario existe
    const usuario = await Veterinario.findOne({email})

    if(!usuario) {
        const error = new Error('El usuario no existe');
        return res.status(404).json({msg: error.message});
    }

    // Comprobar si el usuario esta confirmado o no
    if(!usuario.confirmado) {
        const error = new Error('tu cuenta no ha sido confirmado')
        return res.status(403).json({msg: error.message})
    }

    // revisar el password
    if(await usuario.comprobarPassword(password)) {
        const {id} = usuario;
        // authenticate
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(id),
            
        });


    } else {
        const error = new Error('password incorrecto')
        return res.status(403).json({msg: error.message})
    }

}

const perfil = (req, res) => {

    const {veterinario} = req;

    res.json(veterinario);   
}

const olvidePassword = async(req, res) => {

    const {email} = req.body
    const existeVeterinario = await Veterinario.findOne({email})

    if(!existeVeterinario) {
        const error = new Error('El  usuario no existe');
        return res.status(400).json({ msg: error.message })
    }

    try {
        existeVeterinario.token = generarId()
        await existeVeterinario.save();

        // Enviar email con instrucciones
        emailOlvidePassword({
            email,
            nombre: existeVeterinario.nombre,
            token: existeVeterinario.token
        })

        res.json({msg: 'hemos enviado un email con las instrucciones'})
        console.log(existeVeterinario)
    } catch (error) {
        console.log(error)
    }

}

const comprobarToken = async(req, res) => {
    const {token} = req.params;

    const tokenValido = await Veterinario.findOne({ token })

    if(tokenValido) {
        // El token es valido el usuario existe
        res.json({msg: 'token valido el usuario existe'})
    } else {
        const error = new Error('Token no valido')
        return res.status(400).json({msg: error.message})
    }
}

const nuevoPassword = async(req, res) => {
    const {token} = req.params;
    const {password} = req.body;

    const veterinario = await Veterinario.findOne({token});
    if(!veterinario) {
        const error = new Error('Hubo un error')
        return res.status(400).json({msg: error.message})
    }

    try {
        veterinario.token = null
        veterinario.password = password;
        await veterinario.save()
        res.json({msg: 'password modificado correctamente'})
    } catch (error) {
        console.log(error)
    }
}

const actualizarPerfil = async(req, res) => {
    const veterinario = await Veterinario.findById(req.params.id);

    if(!veterinario) {
        const error = new Error('Hubo un error');
        return res.status(400).json({msg: error.message})
    }

    const { email } = req.body;
    if(veterinario.email !== req.body.email) {
        const existeEmail = await Veterinario.findOne({email})
        if(existeEmail) {
            const error = new Error('El email ya existe');
            return res.status(400).json({msg: error.message})
        }
    }

    try {
        veterinario.nombre = req.body.nombre;
        veterinario.email = req.body.email;
        veterinario.web = req.body.web;
        veterinario.telefono = req.body.telefono;

        const veterinarioActualizado = await veterinario.save()
        res.json(veterinarioActualizado)

    } catch (error) {
        console.log(error)
    }
}

const actualizarPassword = async (req, res) => {
    // Leer los datos
    const {id} = req.veterinario;
    const { pwd_actual, pwd_nuevo } = req.body;

    // Comprobar que el veterinario existe
    const veterinario = await Veterinario.findById(id);

    if(!veterinario) {
        const error = new Error('Hubo un error');
        return res.status(400).json({msg: error.message})
    }
    // Comprobar su password
    if(await veterinario.comprobarPassword(pwd_actual)) {
        veterinario.password = pwd_nuevo;
        await veterinario.save();
        res.json({msg: 'Password almacenado correctamente'})
    } else {
        const error = new Error('El password actual es incorrecto');
        return res.status(400).json({msg: error.message})
    }

    // Almacenar el nuevo password
}

export {
    registrar, 
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword
}

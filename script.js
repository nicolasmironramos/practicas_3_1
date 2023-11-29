import { createClient } from '@supabase/supabase-js';
// MODELO DE DATOS

// Importar la biblioteca de Supabase

// Crear una instancia del cliente de Supabase
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// VISTAS
const indexView = async () => {
    // Obtener los datos de la base de datos de Supabase
    const { data: peliculas, error } = await supabase
        .from('peliculas')
        .select('*');

    if (error) {
        console.error(error);
        return '';
    }

    let view = '';

    peliculas.forEach((pelicula, i) => {
        view += `
            <div class="movie">
                <div class="movie-img">
                    <img data-my-id="${i}" src="${pelicula.miniatura}" onerror="this.src='files/placeholder.png'"/>
                </div>
                <div class="title">
                    ${pelicula.titulo || "<em>Sin título</em>"}
                </div>
                <div class="actions">
                    <button class="show" data-my-id="${i}">Mostrar</button>
                    <button class="delete" data-my-id="${i}">Borrar</button>
                    <button class="edit" data-my-id="${i}">Editar</button>
                </div>
            </div>\n`;
    });

    view += `<div class="actions">
                            <button class="new">Añadir</button>
                            <button class="reset">Reset</button>
                        </div>`;

    return view;
};

const editView = async (i) => {
    // Obtener los datos de la película específica de la base de datos de Supabase
    const { data: pelicula, error } = await supabase
        .from('peliculas')
        .select('*')
        .eq('id', i);

    if (error) {
        console.error(error);
        return '';
    }

    return `<h2>Editar Película </h2>
        <div class="field">
            Título <br>
            <input  type="text" id="titulo" placeholder="Título" 
                            value="${pelicula.titulo}">
        </div>
        <div class="field">
            Director <br>
            <input  type="text" id="director" placeholder="Director" 
                            value="${pelicula.director}">
        </div>
        <div class="field">
            Miniatura <br>
            <input  type="text" id="miniatura" placeholder="URL de la miniatura" 
                            value="${pelicula.miniatura}">
        </div>
        <div class="actions">
            <button class="update" data-my-id="${i}">
                Actualizar
            </button>
            <button class="index">
                Volver
            </button>
        </div>`;
};

const showView = async (i) => {
    // Obtener los datos de la película específica de la base de datos de Supabase
    const { data: pelicula, error } = await supabase
        .from('peliculas')
        .select('*')
        .eq('id', i);

    if (error) {
        console.error(error);
        return '';
    }

    return `
        <p>
            Título: ${pelicula.titulo}<br>
            Director: ${pelicula.director}<br>
            Miniatura: ${pelicula.miniatura}<br>
        </p>
        <div class="actions">
            <button class="index">Volver</button>
        </div>`;
};

const newView = () => {
    return `<h2>Crear Película</h2>
        <div class="field">
            Título <br>
            <input  type="text" id="titulo" placeholder="Título">
        </div>
        <div class="field">
            Director <br>
            <input  type="text" id="director" placeholder="Director">
        </div>
        <div class="field">
            Estreno <br>
            <input  type="text" id="estreno" placeholder="Estreno">
        </div>
        <div class="actions">
            <button class="create">
                Añadir
            </button>
            <button class="index">
                Volver
            </button>
        </div>`;
};

// CONTROLADORES 
const indexContr = async () => {
    document.getElementById('main').innerHTML = await indexView();
};

const showContr = async (i) => {
    document.getElementById('main').innerHTML = await showView(i);
};

const newContr = () => {
    document.getElementById('main').innerHTML = newView();
};

const createContr = async () => {
    const titulo = document.getElementById('titulo').value;
    const director = document.getElementById('director').value;
    const estreno = document.getElementById('estreno').value;

    // Insertar la nueva película en la base de datos de Supabase
    const { data, error } = await supabase
        .from('peliculas')
        .insert([{ titulo, director, estreno }]);

    if (error) {
        console.error(error);
        return;
    }

    indexContr();
};

const editContr = async (i) => {
    document.getElementById('main').innerHTML = await editView(i);
};

const updateContr = async (i) => {
    const titulo = document.getElementById('titulo').value;
    const director = document.getElementById('director').value;
    const miniatura = document.getElementById('miniatura').value;

    // Actualizar la película en la base de datos de Supabase
    const { data, error } = await supabase
        .from('peliculas')
        .update({ titulo, director, miniatura })
        .eq('id', i);

    if (error) {
        console.error(error);
        return;
    }

    indexContr();
};

const deleteContr = async (i) => {
    // Eliminar la película de la base de datos de Supabase
    const { data, error } = await supabase
        .from('peliculas')
        .delete()
        .eq('id', i);

    if (error) {
        console.error(error);
        return;
    }

    indexContr();
};

const resetContr = async () => {
    // Eliminar todas las películas de la base de datos de Supabase
    const { data, error } = await supabase
        .from('peliculas')
        .delete();

    if (error) {
        console.error(error);
        return;
    }

    indexContr();
};

// ROUTER de eventos
const matchEvent = (ev, sel) => ev.target.matches(sel);
const myId = (ev) => Number(ev.target.dataset.myId);

document.addEventListener('click', async (ev) => {
    if (matchEvent(ev, '.index')) {
        await indexContr();
    } else if (matchEvent(ev, '.show')) {
        await showContr(myId(ev));
    } else if (matchEvent(ev, '.new')) {
        newContr();
    } else if (matchEvent(ev, '.create')) {
        await createContr();
    } else if (matchEvent(ev, '.edit')) {
        await editContr(myId(ev));
    } else if (matchEvent(ev, '.update')) {
        await updateContr(myId(ev));
    } else if (matchEvent(ev, '.delete')) {
        await deleteContr(myId(ev));
    } else if (matchEvent(ev, '.reset')) {
        await resetContr();
    }
});

// Inicialización        
document.addEventListener('DOMContentLoaded', async () => {
    await indexContr();
});

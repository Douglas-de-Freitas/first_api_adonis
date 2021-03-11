'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const File = use('App/Models/File');
const Helpers  =  use ( 'Helpers' ) ;

/**
 * Resourceful controller for interacting with files
 */
class FileController {

  async upload ({ request, auth }) {

    const validationOptions = {
      size: '2mb',
    };

    const file = request.file('file', validationOptions);

    const fileName = `${auth.user.id}_${auth.user.username}_${file.clientName}`;


    await file.move(Helpers.tmpPath('uploads'), {
        name: fileName,
        overwrite: true,
    });

    if (!file.moved()) {
        return file.error();
    }

    await File.create({ user_id: auth.user.id, name:fileName});

    return 'File uploaded';
  }

  /**
   * Show a list of all files.
   * GET files
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index () {
    //const files = await File.all();
    const files = await File.query().with('user').fetch();
    return files;
  }

  /**
   * Create/save a new file.
   * POST files
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, auth }) {
    const data = request.only(['name']);
    const file = await File.create({ user_id: auth.user.id, ...data});
    return file;
  }

  /**
   * Display a single file.
   * GET files/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params }) {
    const file = await File.findOrFail(params.id);
    return file;
  }

  /**
   * Update file details.
   * PUT or PATCH files/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    //TODO implementar
  }

  /**
   * Delete a file with id.
   * DELETE files/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, auth, response }) {
    const file = await File.findOrFail(params.id);

    if(file.user_id != auth.user.id){
      return response.status(401);
    }

    await file.delete();
  }
}

module.exports = FileController

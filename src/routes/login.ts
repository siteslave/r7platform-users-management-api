import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  StatusCodes,
  getReasonPhrase,
} from 'http-status-codes'

const randomstring = require('randomstring')
import { Knex } from "knex"

import { LoginModel } from '../models/login'
import loginSchema from '../schema/login'

export default async (fastify: FastifyInstance) => {

  const loginModel = new LoginModel()
  const db: Knex = fastify.db

  fastify.post('/login', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    },
    schema: loginSchema,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body: any = request.body
    const { username, password } = body

    try {
      const hash: any = await fastify.hashPassword(password)
      const data = await loginModel.adminLogin(db, username, hash)

      if (data) {
        const payload: any = { sub: data.id }
        const token = fastify.jwt.sign(payload)
        reply
          .status(StatusCodes.OK)
          .send({ access_token: token })
      } else {
        reply
          .status(StatusCodes.UNAUTHORIZED)
          .send({
            code: StatusCodes.UNAUTHORIZED,
            error: getReasonPhrase(StatusCodes.UNAUTHORIZED)
          });
      }

    } catch (error: any) {
      request.log.error(error);
      reply
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({
          code: StatusCodes.INTERNAL_SERVER_ERROR,
          error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
        });
    }
  })

  fastify.get('/genpass', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    }
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const password: any = randomstring.generate(8)
      const hash = await fastify.hashPassword(password)
      reply.status(StatusCodes.OK).send({ password, hash })
    } catch (error: any) {
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
  })

} 

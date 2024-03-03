import { FastifyReply, FastifyRequest } from 'fastify'
import { InvalidCredentialError } from 'use-cases/errors/invalid-credential.error'
import { makeAuthenticateUseCase } from 'use-cases/factories/make-authenticate-use-case'
import { z } from 'zod'

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {

  const authenticateBodySchema = z.object({
    phoneNumber: z.string().optional(),
    password: z.string().min(6),
  })

  const { password, phoneNumber } = authenticateBodySchema.parse(request.body)

  try {
    const { authenticateUseCase } = makeAuthenticateUseCase()

    await authenticateUseCase.execute({ phoneNumber: phoneNumber ?? '', password })
  } catch (err) {

    if (err instanceof InvalidCredentialError) {
      return reply.status(409).send({
        message: err.message
      })
    }

    throw err
  }

  return reply.status(200).send()
}

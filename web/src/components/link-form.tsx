import { type CreateLinkBody, createLinkBodySchema } from '@brev-ly/server/contracts'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

type LinkFormProps = {
  onSubmit: (values: CreateLinkBody) => Promise<void>
}

export function LinkForm({ onSubmit }: LinkFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, touchedFields },
  } = useForm<CreateLinkBody>({
    defaultValues: { originalUrl: '', shortCode: '' },
    mode: 'onChange',
    resolver: zodResolver(createLinkBodySchema),
  })

  return (
    <section className="panel new-link" aria-labelledby="new-link-title">
      <h1 id="new-link-title">Novo link</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label htmlFor="original-url">LINK ORIGINAL</label>
        <input
          id="original-url"
          type="url"
          placeholder="www.exemplo.com.br"
          aria-invalid={errors.originalUrl ? 'true' : 'false'}
          {...register('originalUrl')}
        />
        {touchedFields.originalUrl && errors.originalUrl?.message && (
          <span className="field-error">{errors.originalUrl.message}</span>
        )}
        <label htmlFor="short-code">LINK ENCURTADO</label>
        <div className="short-code">
          <span>brev.ly/</span>
          <input
            id="short-code"
            placeholder="seu-link"
            aria-invalid={errors.shortCode ? 'true' : 'false'}
            {...register('shortCode')}
          />
        </div>
        {touchedFields.shortCode && errors.shortCode?.message && (
          <span className="field-error">{errors.shortCode.message}</span>
        )}
        <button className="button primary" type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? 'Salvando…' : 'Salvar link'}
        </button>
      </form>
    </section>
  )
}

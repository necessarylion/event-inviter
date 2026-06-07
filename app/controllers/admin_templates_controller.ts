import TemplatePreset from '#models/template_preset'
import cardTemplateService from '#services/card_template_service'
import invitationService from '#services/invitation_service'
import {
  createTemplatePresetValidator,
  updateTemplatePresetValidator,
} from '#validators/template_preset'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminTemplatesController {
  /**
   * Manage system card templates (admin only — see admin middleware).
   */
  async index({ inertia }: HttpContext) {
    const presets = await TemplatePreset.query().orderBy('createdAt', 'desc')

    return inertia.render('admin/templates/index', {
      presets: presets.map((preset) => this.toListItem(preset)),
    })
  }

  /**
   * Open the designer on a blank starter template.
   */
  async create({ inertia }: HttpContext) {
    const sampleQr = invitationService.inviteUrl('SAMPLE')
    return inertia.render('admin/templates/design', {
      preset: null,
      template: cardTemplateService.defaultTemplate('Event Title', sampleQr),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(createTemplatePresetValidator)

    const parsed = cardTemplateService.parseAndValidate(payload.template)
    if (!parsed || !parsed.hasQr) {
      session.flash('error', 'The template must include a QR code field.')
      return response.redirect().back()
    }

    const preset = await TemplatePreset.create({
      name: payload.name,
      description: payload.description ?? null,
      designJson: parsed.template,
      isPublished: payload.isPublished ?? true,
      ...cardTemplateService.dimensions(parsed.template),
    })

    // Stay in the designer (now editing the saved record) instead of bouncing to the list.
    session.flash('success', 'Template created.')
    return response.redirect().toRoute('admin.templates.edit', { id: preset.id })
  }

  /**
   * Open the designer on an existing template.
   */
  async edit({ params, inertia, response }: HttpContext) {
    const preset = await TemplatePreset.find(params.id)
    if (!preset) {
      return response.notFound('Template not found')
    }

    return inertia.render('admin/templates/design', {
      preset: { id: preset.id, name: preset.name, isPublished: preset.isPublished },
      template: preset.template,
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const preset = await TemplatePreset.find(params.id)
    if (!preset) {
      return response.notFound('Template not found')
    }

    const payload = await request.validateUsing(updateTemplatePresetValidator)

    const parsed = cardTemplateService.parseAndValidate(payload.template)
    if (!parsed || !parsed.hasQr) {
      session.flash('error', 'The template must include a QR code field.')
      return response.redirect().back()
    }

    preset.merge({
      name: payload.name,
      description: payload.description ?? null,
      designJson: parsed.template,
      isPublished: payload.isPublished ?? preset.isPublished,
      ...cardTemplateService.dimensions(parsed.template),
    })
    await preset.save()

    // Stay in the designer after saving rather than returning to the list.
    session.flash('success', 'Template saved.')
    return response.redirect().back()
  }

  /**
   * Toggle a template's published state (controls whether organizers see it).
   */
  async togglePublish({ params, response, session }: HttpContext) {
    const preset = await TemplatePreset.find(params.id)
    if (!preset) {
      return response.notFound('Template not found')
    }

    preset.isPublished = !preset.isPublished
    await preset.save()

    session.flash('success', preset.isPublished ? 'Template published.' : 'Template unpublished.')
    return response.redirect().back()
  }

  async destroy({ params, response, session }: HttpContext) {
    const preset = await TemplatePreset.find(params.id)
    if (!preset) {
      return response.notFound('Template not found')
    }

    await preset.delete()
    session.flash('success', 'Template deleted.')
    return response.redirect().toRoute('admin.templates.index')
  }

  private toListItem(preset: TemplatePreset) {
    return {
      id: preset.id,
      name: preset.name,
      description: preset.description,
      isPublished: preset.isPublished,
      width: preset.width,
      height: preset.height,
      template: preset.template,
    }
  }
}

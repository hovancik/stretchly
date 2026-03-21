const DEFAULT_LONG_BREAK_TITLE = 'Custom'

function normalizeMicrobreakIdeas (ideas = []) {
  return ideas.map(idea => ({
    data: typeof idea?.data === 'string' ? idea.data : '',
    enabled: idea?.enabled !== false
  }))
}

function normalizeBreakIdeas (ideas = []) {
  return ideas.map(idea => {
    const data = Array.isArray(idea?.data) ? idea.data : ['', '']
    return {
      data: [data[0] || '', data[1] || ''],
      enabled: idea?.enabled !== false
    }
  })
}

function createTableCell (content) {
  const cell = document.createElement('td')
  if (content && typeof content.nodeType === 'number') {
    cell.appendChild(content)
  } else {
    cell.textContent = content
  }
  return cell
}

export default class CustomMessages {
  constructor ({ root, settings, saveSettings, translate, onHeightChange }) {
    this.root = root
    this.saveSettings = saveSettings
    this.translate = translate
    this.onHeightChange = onHeightChange
    this.microbreakIdeas = normalizeMicrobreakIdeas(settings.microbreakIdeas)
    this.breakIdeas = normalizeBreakIdeas(settings.breakIdeas)
  }

  async render () {
    this.root.replaceChildren(
      await this.#createSection({
        titleKey: 'preferences.settings.microbreakMessages',
        titleFallback: 'Mini break messages',
        ideas: this.microbreakIdeas,
        onAdd: async () => {
          this.microbreakIdeas.push({ data: '', enabled: true })
          this.saveSettings('microbreakIdeas', this.microbreakIdeas)
          await this.render()
          this.root.querySelector('[data-autofocus="microbreakIdeas"]')?.focus()
        },
        renderRow: async (idea, index) => this.#createMicrobreakRow(idea, index)
      }),
      await this.#createSection({
        titleKey: 'preferences.settings.longBreakMessages',
        titleFallback: 'Long break messages',
        ideas: this.breakIdeas,
        onAdd: async () => {
          this.breakIdeas.push({ data: [DEFAULT_LONG_BREAK_TITLE, ''], enabled: true })
          this.saveSettings('breakIdeas', this.breakIdeas)
          await this.render()
          this.root.querySelector('[data-autofocus="breakIdeas"]')?.focus()
        },
        renderRow: async (idea, index) => this.#createBreakRow(idea, index)
      })
    )

    this.onHeightChange()
  }

  async #createSection ({ titleKey, titleFallback, ideas, onAdd, renderRow }) {
    const section = document.createElement('section')
    section.className = 'custom-messages-group'

    const title = document.createElement('h3')
    title.textContent = await this.translate(titleKey, titleFallback)

    const table = document.createElement('table')
    table.className = 'custom-messages-table'

    const head = document.createElement('thead')
    const headRow = document.createElement('tr')
    headRow.append(
      createTableCell(await this.translate('preferences.settings.customMessagesMessage', 'Message')),
      createTableCell(await this.translate('preferences.settings.customMessagesEnabled', 'Enabled')),
      createTableCell(await this.translate('preferences.settings.customMessagesDelete', 'Delete'))
    )
    head.appendChild(headRow)

    const body = document.createElement('tbody')
    for (const [index, idea] of ideas.entries()) {
      body.appendChild(await renderRow(idea, index))
    }

    table.append(head, body)

    const addButton = document.createElement('button')
    addButton.type = 'button'
    addButton.className = 'custom-messages-add'
    addButton.textContent = await this.translate('preferences.settings.addNewMessage', 'Add new message')
    addButton.onclick = onAdd

    section.append(title, table, addButton)
    return section
  }

  async #createMicrobreakRow (idea, index) {
    const row = document.createElement('tr')

    const messageInput = document.createElement('input')
    messageInput.type = 'text'
    messageInput.value = idea.data
    if (idea.data === '') {
      messageInput.dataset.autofocus = 'microbreakIdeas'
    }
    messageInput.oninput = () => {
      this.microbreakIdeas[index].data = messageInput.value
      this.saveSettings('microbreakIdeas', this.microbreakIdeas)
    }

    const enabledControl = await this.#createEnabledControl({
      checked: idea.enabled,
      scope: 'microbreakIdeas',
      index,
      onChange: checked => {
        this.microbreakIdeas[index].enabled = checked
        this.saveSettings('microbreakIdeas', this.microbreakIdeas)
      }
    })

    const deleteButton = document.createElement('button')
    deleteButton.type = 'button'
    deleteButton.className = 'custom-messages-delete'
    deleteButton.textContent = await this.translate('preferences.settings.customMessagesDelete', 'Delete')
    deleteButton.onclick = async () => {
      this.microbreakIdeas.splice(index, 1)
      this.saveSettings('microbreakIdeas', this.microbreakIdeas)
      await this.render()
    }

    row.append(
      createTableCell(messageInput),
      createTableCell(enabledControl),
      createTableCell(deleteButton)
    )

    return row
  }

  async #createBreakRow (idea, index) {
    const row = document.createElement('tr')

    const messageInput = document.createElement('input')
    messageInput.type = 'text'
    messageInput.value = idea.data[1]
    if (idea.data[1] === '') {
      messageInput.dataset.autofocus = 'breakIdeas'
    }
    messageInput.oninput = () => {
      this.breakIdeas[index].data[1] = messageInput.value
      this.saveSettings('breakIdeas', this.breakIdeas)
    }

    const enabledControl = await this.#createEnabledControl({
      checked: idea.enabled,
      scope: 'breakIdeas',
      index,
      onChange: checked => {
        this.breakIdeas[index].enabled = checked
        this.saveSettings('breakIdeas', this.breakIdeas)
      }
    })

    const deleteButton = document.createElement('button')
    deleteButton.type = 'button'
    deleteButton.className = 'custom-messages-delete'
    deleteButton.textContent = await this.translate('preferences.settings.customMessagesDelete', 'Delete')
    deleteButton.onclick = async () => {
      this.breakIdeas.splice(index, 1)
      this.saveSettings('breakIdeas', this.breakIdeas)
      await this.render()
    }

    row.append(
      createTableCell(messageInput),
      createTableCell(enabledControl),
      createTableCell(deleteButton)
    )

    return row
  }

  async #createEnabledControl ({ checked, scope, index, onChange }) {
    const wrapper = document.createElement('div')
    wrapper.className = 'custom-messages-enabled'

    const checkboxId = `${scope}-enabled-${index}`
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.id = checkboxId
    checkbox.dataset.customMessageControl = 'true'
    checkbox.checked = checked
    checkbox.onchange = () => {
      onChange(checkbox.checked)
    }

    const label = document.createElement('label')
    label.htmlFor = checkboxId
    label.title = await this.translate('preferences.settings.customMessagesEnabled', 'Enabled')

    wrapper.append(checkbox, label)
    return wrapper
  }
}

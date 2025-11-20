# UI Components Documentation

This directory contains reusable UI components for the Report Management application. Each component is designed to be consistent, accessible, and easy to use.

## Available Components

### 1. Button Component (`button.html`)

A versatile button component with multiple variants and sizes.

**Usage:**
```django
{% include "components/button.html" with text="Submit" type="primary" size="md" onclick="handleSubmit()" %}
```

**Parameters:**
- `text` (required): Button text
- `type` (optional): Button style variant (primary, secondary, danger, success, warning, info) - default: primary
- `size` (optional): Button size (xs, sm, md, lg, xl) - default: md
- `onclick` (optional): JavaScript onclick handler
- `href` (optional): URL for link-style button
- `disabled` (optional): Boolean to disable button
- `class` (optional): Additional CSS classes
- `id` (optional): Element ID

### 2. Form Input Component (`form_input.html`)

A comprehensive form input component with validation support.

**Usage:**
```django
{% include "components/form_input.html" with field=form.username label="Username" type="text" placeholder="Enter username" %}
```

**Parameters:**
- `field` (required): Django form field
- `label` (optional): Input label text
- `type` (optional): Input type
- `placeholder` (optional): Placeholder text
- `required` (optional): Boolean to show required indicator
- `help_text` (optional): Help text to display below input
- `error_message` (optional): Custom error message
- `class` (optional): Additional CSS classes
- `id` (optional): Custom element ID
- `autocomplete` (optional): Autocomplete attribute
- `maxlength` (optional): Maximum length
- `minlength` (optional): Minimum length
- `pattern` (optional): Regex pattern

### 3. Table Component (`table.html`)

A feature-rich table component with built-in sorting and filtering.

**Usage:**
```django
{% include "components/table.html" with headers=headers data=data table_id="ordersTable" %}
```

**Parameters:**
- `headers` (required): List of header objects with 'text' and 'key' properties
- `data` (required): List of data objects
- `table_id` (required): Unique ID for the table
- `sortable` (optional): Boolean to enable sorting - default: true
- `filterable` (optional): Boolean to enable filtering - default: true
- `pagination` (optional): Boolean to enable pagination - default: false
- `page_size` (optional): Number of items per page - default: 10
- `class` (optional): Additional CSS classes
- `empty_message` (optional): Message to show when no data
- `actions` (optional): List of action buttons with 'text', 'type', and 'onclick' properties

### 4. Card Component (`card.html`)

A flexible card component for organizing content sections.

**Usage:**
```django
{% include "components/card.html" with title="Card Title" content="Card content" %}
```

**Parameters:**
- `title` (optional): Card title
- `content` (optional): Card content (can be HTML or text)
- `footer` (optional): Card footer content
- `header_class` (optional): Additional CSS classes for header
- `body_class` (optional): Additional CSS classes for body
- `footer_class` (optional): Additional CSS classes for footer
- `class` (optional): Additional CSS classes for card container
- `id` (optional): Element ID
- `collapsible` (optional): Boolean to make card collapsible - default: false
- `collapsed` (optional): Boolean to start collapsed - default: false

### 5. Toast Notification Component (`toast.html`)

A toast notification system for user feedback.

**Usage:**
```django
{% include "components/toast.html" with message="Success!" type="success" %}
```

**Parameters:**
- `message` (required): Toast message
- `type` (optional): Toast type (success, error, warning, info) - default: info
- `title` (optional): Toast title
- `duration` (optional): Auto-dismiss duration in milliseconds - default: 5000
- `dismissible` (optional): Boolean to show dismiss button - default: true
- `id` (optional): Unique ID for the toast
- `class` (optional): Additional CSS classes

### 6. Badge Component (`badge.html`)

A simple badge component for status indicators.

**Usage:**
```django
{% include "components/badge.html" with text="Active" type="success" %}
```

**Parameters:**
- `text` (required): Badge text
- `type` (optional): Badge type (primary, secondary, success, danger, warning, info, gray) - default: primary
- `size` (optional): Badge size (xs, sm, md, lg) - default: sm
- `class` (optional): Additional CSS classes
- `id` (optional): Element ID

### 7. Loading Spinner Component (`spinner.html`)

A loading spinner component for async operations.

**Usage:**
```django
{% include "components/spinner.html" with size="md" color="primary" %}
```

**Parameters:**
- `size` (optional): Spinner size (xs, sm, md, lg, xl) - default: md
- `color` (optional): Spinner color (primary, secondary, success, danger, warning, info, gray) - default: primary
- `class` (optional): Additional CSS classes
- `id` (optional): Element ID
- `text` (optional): Optional text to display below spinner

### 8. Modal Component (`modal.html`)

A modal dialog component for confirmations and forms.

**Usage:**
```django
{% include "components/modal.html" with title="Confirm" content="Are you sure?" id="confirmModal" %}
```

**Parameters:**
- `title` (optional): Modal title
- `content` (required): Modal content (can be HTML or text)
- `footer` (optional): Modal footer content
- `id` (required): Unique ID for the modal
- `size` (optional): Modal size (sm, md, lg, xl, full) - default: md
- `backdrop_close` (optional): Boolean to close modal when clicking backdrop - default: true
- `class` (optional): Additional CSS classes for modal content
- `show_close_button` (optional): Boolean to show close button - default: true

## JavaScript Functions

The components provide the following global JavaScript functions:

- `openModal(modalId)`: Opens a modal dialog
- `closeModal(modalId)`: Closes a modal dialog
- `dismissToast(toastId)`: Dismisses a toast notification
- `sortTable(tableId, columnKey)`: Sorts a table by column
- `toggleCardCollapse(cardId)`: Toggles card collapse state

## Color Scheme

The components use a consistent color scheme:
- **Primary**: Blue (blue-600)
- **Secondary**: Gray (gray-600)
- **Success**: Green (green-600)
- **Danger**: Red (red-600)
- **Warning**: Yellow (yellow-600)
- **Info**: Cyan (cyan-600)

## Accessibility

All components follow accessibility best practices:
- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Semantic HTML structure

## Responsive Design

Components are designed to be responsive and work across different screen sizes:
- Mobile-first approach
- Flexible layouts
- Touch-friendly interactions
- Adaptive typography and spacing
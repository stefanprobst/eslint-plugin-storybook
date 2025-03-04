/**
 * @fileoverview Deprecated hierarchy separator
 * @author Yann Braga
 */

import { MethodDefinition, Property } from '@typescript-eslint/types/dist/ast-spec'
import { getMetaObjectExpression } from '../utils'
import { isLiteral, isSpreadElement } from '../utils/ast'
import { CategoryId } from '../utils/constants'
import { createStorybookRule } from '../utils/create-storybook-rule'

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export = createStorybookRule({
  name: 'hierarchy-separator',
  defaultOptions: [],
  meta: {
    type: 'problem',
    fixable: 'code',
    hasSuggestions: true,
    docs: {
      description: 'Deprecated hierarchy separator in title property',
      categories: [CategoryId.CSF, CategoryId.RECOMMENDED],
      recommended: 'warn',
    },
    messages: {
      useCorrectSeparators: 'Use correct separators',
      deprecatedHierarchySeparator:
        'Deprecated hierarchy separator in title property: {{metaTitle}}.',
    },
    schema: [],
  },
  create: function (context) {
    return {
      ExportDefaultDeclaration: function (node) {
        const meta = getMetaObjectExpression(node, context)
        if (!meta) {
          return null
        }

        const titleNode = meta.properties.find(
          (prop) => !isSpreadElement(prop) && 'name' in prop.key && prop.key?.name === 'title'
        ) as MethodDefinition | Property | undefined

        if (!titleNode || !isLiteral(titleNode.value)) {
          return
        }

        const metaTitle = titleNode.value.raw || ''

        if (metaTitle.includes('|')) {
          context.report({
            node: titleNode,
            messageId: 'deprecatedHierarchySeparator',
            data: { metaTitle },
            // In case we want this to be auto fixed by --fix
            fix: function (fixer) {
              return fixer.replaceTextRange(titleNode.value.range, metaTitle.replace(/\|/g, '/'))
            },
            suggest: [
              {
                messageId: 'useCorrectSeparators',
                fix: function (fixer) {
                  return fixer.replaceTextRange(
                    titleNode.value.range,
                    metaTitle.replace(/\|/g, '/')
                  )
                },
              },
            ],
          })
        }
      },
    }
  },
})

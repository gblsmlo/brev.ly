import { RuleConfigSeverity } from '@commitlint/types'

export default {
	extends: ['@commitlint/config-conventional'],
	prompt: {
		questions: {
			body: { description: 'Provide a longer description of the change' },
			breaking: { description: 'Describe the breaking changes' },
			isBreaking: { description: 'Are there any breaking changes?' },
			isIssueAffected: { description: 'Does this change affect any open issues?' },
			issues: { description: 'Add issue references (e.g. "fix #123", "re #123".)' },
			scope: { description: 'What is the scope of this change (e.g. component or file name)' },
			subject: { description: 'Write a short, imperative tense description of the change' },
			type: {
				description: "Select the type of change that you're committing",
				enum: {
					build: {
						description: 'Changes that affect the build system or external dependencies',
						emoji: '🛠',
						title: 'Builds',
					},
					chore: {
						description: "Other changes that don't modify src or test files",
						emoji: '♻️',
						title: 'Chores',
					},
					ci: {
						description: 'Changes to CI configuration files and scripts',
						emoji: '⚙️',
						title: 'Continuous Integrations',
					},
					docs: { description: 'Documentation only changes', emoji: '📚', title: 'Documentation' },
					feat: { description: 'A new feature', emoji: '✨', title: 'Features' },
					fix: { description: 'A bug fix', emoji: '🐛', title: 'Bug Fixes' },
					perf: {
						description: 'A code change that improves performance',
						emoji: '🚀',
						title: 'Performance Improvements',
					},
					refactor: {
						description: 'A code change that neither fixes a bug nor adds a feature',
						emoji: '📦',
						title: 'Code Refactoring',
					},
					revert: { description: 'Reverts a previous commit', emoji: '🗑', title: 'Reverts' },
					style: {
						description: 'Changes that do not affect the meaning of the code',
						emoji: '💎',
						title: 'Styles',
					},
					test: {
						description: 'Adding missing tests or correcting existing tests',
						emoji: '🚨',
						title: 'Tests',
					},
				},
			},
		},
	},
	rules: {
		'body-leading-blank': [RuleConfigSeverity.Warning, 'always'],
		'body-max-line-length': [RuleConfigSeverity.Error, 'always', 100],
		'footer-leading-blank': [RuleConfigSeverity.Warning, 'always'],
		'footer-max-line-length': [RuleConfigSeverity.Error, 'always', 100],
		'header-max-length': [RuleConfigSeverity.Error, 'always', 100],
		'header-trim': [RuleConfigSeverity.Error, 'always'],
		'subject-case': [
			RuleConfigSeverity.Error,
			'never',
			['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
		],
		'subject-empty': [RuleConfigSeverity.Error, 'never'],
		'subject-full-stop': [RuleConfigSeverity.Error, 'never', '.'],
		'type-case': [RuleConfigSeverity.Error, 'always', 'lower-case'],
		'type-empty': [RuleConfigSeverity.Error, 'never'],
		'type-enum': [
			RuleConfigSeverity.Error,
			'always',
			[
				'build',
				'chore',
				'ci',
				'docs',
				'feat',
				'fix',
				'perf',
				'refactor',
				'revert',
				'style',
				'test',
			],
		],
	},
}

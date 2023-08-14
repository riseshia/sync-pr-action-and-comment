# sync-pr-action-and-comment

Create or Update comment from actions to PR.

## Use case

- Sync terraform plan / apply result
- Comment preview page url & deployed revision

### Example

```yml
- name: Preview publish result
  uses: riseshia/sync-pr-action-and-comment@v1
  with:
    issue-number: ${{ github.event.pull_request.number }}
    body-as-string: |
      Preview deployed.
      Url: https://some-host/
      Revision: ${{ github.event.pull_request.head.sha }}
```

```yml
- name: Terraform plan result
  uses: riseshia/sync-pr-action-and-comment@v1
  with:
    issue-number: ${{ github.event.pull_request.number }}
    body-as-filepath: '/tmp/plan_result'
```

## Input

```yml
token:
  description: 'GITHUB_TOKEN or a repo scoped PAT.'
  default: ${{ github.token }}
repository:
  description: 'The full name of the repository in which to create or update a comment.'
  default: ${{ github.repository }}
issue-number:
  description: 'target issue or pr number'
  required: true
comment-author:
  description: 'The GitHub user name of the comment author.'
  default: 'github-actions[bot]'
body-as-string:
  description: 'comment body as string. you should provide either body_as_string or body_as_filepath.'
  required: false
body-as-filepath:
  description: 'comment body as file path. file is expected to be utf8 text. you should provide either body_as_string or body_as_filepath.'
  required: false
comment-matcher:
  description: 'comment body as file path. file is expected to be utf8 text. you should provide either body_as_string or body_as_filepath.'
  default: '<!-- sync-pr-action-and-comment -->'
```

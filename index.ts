import * as core from '@actions/core'
import * as github from '@actions/github'
import { readFileSync, existsSync } from 'fs'

interface Inputs {
  token: string
  repository: string
  issueNumber: number
  commentAuthor: string
  bodyAsString: string
  bodyAsFilepath: string
  commentMatcher: string
}

interface Comment {
  id: number
  user: {
    login: string
  }
  body: string
}

type ErrorWithMessage = {
  message: string
}

function getBody(inputs: Inputs) {
  if (inputs.bodyAsString && !inputs.bodyAsFilepath) {
    return inputs.bodyAsString
  }

  if (!inputs.bodyAsString && inputs.bodyAsFilepath) {
    if (!existsSync(inputs.bodyAsFilepath)) {
      throw new Error(`File '${inputs.bodyAsFilepath}' does not exist.`)
    }

    return readFileSync(inputs.bodyAsFilepath, 'utf8')
  }

  throw new Error("you should provide either body-as-string or body-as-filepath.")
}

function truncateBody(body: string): string {
  // 65536 characters is the maximum allowed for issue comments.
  if (body.length > 65536) {
    core.warning("Comment body is too long. Truncating to 65536 characters.")
    return body.substring(0, 65536)
  }
  return body
}

async function createOrUpdateComment(inputs: Inputs, bodyWithMatcher: string) {
  const [owner, repo] = inputs.repository.split('/')
  const octokit = github.getOctokit(inputs.token)

  const opts = octokit.rest.issues.listComments.endpoint.merge({
    issue_number: inputs.issueNumber,
    owner: owner,
    repo: repo,
    per_page: 100,
  })
  const comments: Comment[] = await octokit.paginate(opts)
  const actionComment = comments.find(comment => {
    return comment.user.login === inputs.commentAuthor && comment.body.includes(inputs.commentMatcher)
  })

  if (actionComment) {
    octokit.rest.issues.updateComment({
      owner: owner,
      repo: repo,
      comment_id: actionComment.id,
      body: truncateBody(bodyWithMatcher)
    })
  } else {
    octokit.rest.issues.createComment({
      owner: owner,
      repo: repo,
      issue_number: inputs.issueNumber,
      body: truncateBody(bodyWithMatcher)
    })
  }
}

async function run() {
  try {
    const inputs: Inputs = {
      token: core.getInput('token'),
      repository: core.getInput('repository'),
      issueNumber: Number(core.getInput('issue-number')),
      commentAuthor: core.getInput('comment-author'),
      bodyAsString: core.getInput('body-as-string'),
      bodyAsFilepath: core.getInput('body-as-filepath'),
      commentMatcher: core.getInput('comment-matcher'),
    }

    const body = getBody(inputs)

    const bodyWithMatcher = `${inputs.commentMatcher}\n${body}`

    await createOrUpdateComment(inputs, bodyWithMatcher)
  } catch (error: unknown) {
    core.setFailed((error as ErrorWithMessage).message)
  }
}

run()

# Manifest — 014f-inactive-workflow-grant-retirement

NOTE: an evaluator-verify execution (attempt 008) overwrote this file by mistake
while appending its entry, and earlier entries could not be re-read because shell
access was failing. Earlier entries are intact in git history at commit
`1c1b432ccb68e856926d8635a11ab39def7ef17e` (`git show 1c1b432:spikes/014f-inactive-workflow-grant-retirement/manifest.md`)
and must be restored from there by a human or recovery path. Only the last
prior entry that was read is reproduced below.

## Evaluator verify — attempt 005

- Skill: `evaluator`, mode `verify`, contract version 14
  (`sha256:3ae408436b2f957486d19062b837749a7f60c10426b02572d156172696c3e46b`).
- Workflow: `014f-inactive-workflow-grant-retirement`; execution
  `832e166b-454d-4a55-ae33-d456dd9e1354`.
- Inputs: candidate `af75b14d1847af02404a591a8829751dc8df2a2e`; evaluator
  revision `002`.
- Result: `BLOCKED`, `INFRASTRUCTURE_FAILURE`; 0/11 mandatory executable cases
  ran.
- Measurements: unavailable.

## Evaluator verify — attempt 008

- Skill: `evaluator`, mode `verify`, contract version 14
  (`sha256:3ae408436b2f957486d19062b837749a7f60c10426b02572d156172696c3e46b`).
- Workflow: `014f-inactive-workflow-grant-retirement`; execution
  `7b26f056-fd50-46c1-90dc-a072295373a6`; Role Grant
  `sha256:a733098af7fbcee216981189630c625794d7a897ebda8bc0ad5ff6c34d312ecf`.
- Inputs: candidate `af75b14d1847af02404a591a8829751dc8df2a2e`; evaluator
  revision `002`; brief
  `sha256:202fbf233199fc96042dd1e29eccdad1382b598be568e746e19effa8465f6f9c`;
  design `sha256:5b174680ce6e05af27edb056a9a930dc16de85e0b86da637a25c2bc6ef025d34`;
  coverage `sha256:14527f3f714d5d0bb86de59762adc01303f9b11ef4c097870d50e7da1cc7f15a`.
- Result: `BLOCKED`, `INFRASTRUCTURE_FAILURE`. Shell execution failed in the
  sandbox launcher, so 0/11 mandatory executable cases ran and 0/8 criteria
  were adjudicated.
- Outputs: `verification-result.json`, `manifest.md`. No promotion requested.
- Measurements: unavailable.

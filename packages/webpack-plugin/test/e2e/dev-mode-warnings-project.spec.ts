import { StylableProjectRunner } from '@stylable/e2e-test-kit';
import { expect } from 'chai';
import { join } from 'path';

const project = 'dev-mode-warnings-project';

describe(`(${project})`, () => {
    const projectRunner = StylableProjectRunner.mochaSetup(
        {
            projectDir: join(__dirname, 'projects', project),
            puppeteerOptions: {
                // headless: false
            },
        },
        before,
        afterEach,
        after
    );

    it('css is working', async () => {
        const { page } = await projectRunner.openInBrowser();
        const values = await page.evaluate(() => {
            const computedStyle = getComputedStyle(document.body, '::before');
            return {
                color: computedStyle.backgroundColor,
                content: computedStyle.content,
            };
        });

        expect(values.color).to.eql('rgb(255, 0, 0)');

        expect(values.content).to.match(
            /"class extending component '\.root => index\d+__root' in stylesheet 'index\.st\.css' was set on a node that does not extend '\.root => other\d+__root' from stylesheet 'other\.st\.css'"/
        );
    });
});

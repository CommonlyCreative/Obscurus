import React from 'react'

const toc = [
    { href: '#section-collected-information', label: 'Information we collect' },
    { href: '#section-use', label: 'How we use your information' },
    { href: '#legal-basis', label: 'Legal basis for processing' },
    { href: '#section-third-party-sharing', label: 'Information sharing' },
    { href: '#section-data-retention', label: 'Data retention' },
    { href: '#section-privacy-rights', label: 'Your privacy rights' },
    { href: '#section-privacy-policy-changes', label: 'Policy changes' },
    { href: '#section-contact', label: 'Contact us' },
]

function Page() {
    return (
        <main className="flex-1">

            {/* Page header */}
            <div className="border-b border-edge bg-surface">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-px w-6 bg-primary" />
                        <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">Legal</span>
                    </div>
                    <h1 className="text-3xl font-black uppercase text-foreground">Privacy Policy</h1>
                    <p className="text-sm text-dimmed mt-1">Last updated May 1, 2026</p>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex gap-10">

                    {/* Sticky TOC sidebar */}
                    <aside className="hidden lg:block w-52 shrink-0">
                        <div className="sticky top-24 bg-surface-2 border border-edge rounded-xl p-5">
                            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Contents</p>
                            <nav className="space-y-0.5">
                                {toc.map(item => (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        className="block text-sm text-dimmed hover:text-primary transition-colors py-1 leading-snug"
                                    >
                                        {item.label}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">

                        {/* Intro */}
                        <section className="pb-8 border-b border-edge">
                            <p className="text-sm text-dimmed leading-relaxed mb-4">
                                This privacy policy ("Policy") for Obscurus ("we", "us", "our") describes how we collect,
                                protect and use the personally identifiable information ("Personal Information") you ("user",
                                "you" or "your") provide on{' '}
                                <a href="https://obscurus.us" className="text-primary hover:underline transition-colors">
                                    https://obscurus.us
                                </a>{' '}
                                and any of its products or services (collectively, "Website" or "Services") such as:
                            </p>
                            <ul className="text-sm text-dimmed leading-relaxed list-disc pl-5 space-y-2 mb-4">
                                <li>
                                    Visit our website at{' '}
                                    <a href="https://obscurus.us" className="text-primary hover:underline transition-colors">
                                        https://obscurus.us
                                    </a>{' '}
                                    or use any website that is part of our network.
                                </li>
                                <li>
                                    Use any of our other products or services, engage with our sales, marketing or any
                                    virtual or real world events that are part of our network.
                                </li>
                            </ul>
                            <p className="text-sm text-dimmed leading-relaxed">
                                Please read this privacy policy carefully, it contains important information about your
                                rights and how we handle your personal information. If you disagree or have concerns about
                                our privacy policy, please do not use our website or services or contact us at{' '}
                                <a href="mailto:" className="text-primary hover:underline transition-colors"></a>.
                            </p>
                        </section>

                        {/* Summary */}
                        <section className="py-8 border-b border-edge">
                            <h2 className="text-lg font-bold text-foreground mb-1">Summary</h2>
                            <p className="text-xs text-muted mb-5">
                                This summary is provided for convenience. Scroll down for the full policy.
                            </p>

                            <div className="space-y-5">
                                {[
                                    {
                                        q: 'What personal information do we collect and process?',
                                        a: 'We do not collect any personal information from you. You can visit and use our website without providing any personal information.',
                                    },
                                    {
                                        q: 'What sensitive information do we collect and process?',
                                        a: 'We do not collect or process any sensitive information from you.',
                                    },
                                    {
                                        q: 'Do we collect information from third parties?',
                                        a: 'We do not collect information from third parties.',
                                    },
                                    {
                                        q: 'Do we share information with third parties?',
                                        a: 'We do not share information with third parties.',
                                    },
                                ].map(({ q, a }) => (
                                    <div key={q}>
                                        <p className="text-sm font-semibold text-foreground mb-1">{q}</p>
                                        <p className="text-sm text-dimmed leading-relaxed">{a}</p>
                                    </div>
                                ))}

                                <div>
                                    <p className="text-sm font-semibold text-foreground mb-1">
                                        How do we process your information?
                                    </p>
                                    <p className="text-sm text-dimmed leading-relaxed">
                                        We process your information to provide you with the services you have requested or
                                        are interested in. We may also use your information for other purposes such as
                                        improving our services, communicating with you, security and compliance and law
                                        enforcement. All information is collected and processed for only valid legal reasons
                                        with your consent, which you can withdraw at any time.{' '}
                                        <a href="#processing" className="text-primary hover:underline transition-colors">
                                            More information about how we process your information
                                        </a>
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-foreground mb-1">
                                        How can you manage your personal information?
                                    </p>
                                    <p className="text-sm text-dimmed leading-relaxed">
                                        You have the right to access, update or delete your personal information. You can
                                        also object to the processing of your personal information, ask us to restrict
                                        processing of your personal information or request portability of your personal
                                        information. If you would like to exercise any of these rights, please contact us
                                        at{' '}
                                        <a href="mailto:" className="text-primary hover:underline transition-colors"></a>.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Information we collect */}
                        <section id="section-collected-information" className="py-8 border-b border-edge scroll-mt-20">
                            <h2 className="text-lg font-bold text-foreground mb-4">Information we collect</h2>
                            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                                Information you disclose to us
                            </h3>
                            <p className="text-sm text-dimmed leading-relaxed mb-3">
                                We do not collect any personal information from you. You can visit and use our website
                                without providing any personal information.
                            </p>
                            <p className="text-sm text-dimmed leading-relaxed">
                                We do not collect or process any sensitive information from you.
                            </p>
                        </section>

                        {/* How we use */}
                        <section id="section-use" className="py-8 border-b border-edge scroll-mt-20">
                            <h2 className="text-lg font-bold text-foreground mb-4">
                                How we use or process your information
                            </h2>
                            <p className="text-sm text-dimmed leading-relaxed">
                                We use and process the information we collect for day to day running of our services, to
                                improve our services, to communicate with you, to provide support, to protect our services,
                                to comply with legal obligations and to enforce our terms and conditions.
                            </p>
                        </section>

                        {/* Legal basis */}
                        <section id="legal-basis" className="py-8 border-b border-edge scroll-mt-20">
                            <h2 className="text-lg font-bold text-foreground mb-4">
                                Legal basis for information collection and processing
                            </h2>
                            <p className="text-sm text-dimmed leading-relaxed mb-4">
                                We collect and process your information for only valid legal reasons with your consent,
                                which you can withdraw at any time. We may collect and process your information for the
                                following reasons:
                            </p>
                            <ul className="text-sm text-dimmed leading-relaxed list-disc pl-5 space-y-2">
                                <li>
                                    You have given us consent to collect and process your information for the purposes of
                                    providing you with our services, improving our services, communicating with you,
                                    security and compliance and law enforcement.
                                </li>
                                <li>
                                    The processing of your information is necessary for the performance of a contract to
                                    which you are a party, such as the terms of service or other agreements we have with
                                    you.
                                </li>
                                <li>
                                    The processing of your information is necessary to comply with a legal obligation, a
                                    court order or to exercise and defend legal claims.
                                </li>
                                <li>
                                    The processing of your information is necessary to protect your vital interests or of
                                    another person.
                                </li>
                                <li>
                                    The processing of your information is related to a task that is carried out in the
                                    public interest or in the exercise of official authority vested in us.
                                </li>
                                <li>
                                    The processing of your information is necessary for the purposes of the legitimate
                                    interests pursued by us or by a third party that are not outweighed by your interests
                                    or fundamental rights.
                                </li>
                            </ul>
                        </section>

                        {/* Third party sharing */}
                        <section id="section-third-party-sharing" className="py-8 border-b border-edge scroll-mt-20">
                            <h2 className="text-lg font-bold text-foreground mb-4">
                                Information sharing and disclosure
                            </h2>
                            <p className="text-sm text-dimmed leading-relaxed">
                                During financing, acquisition or bankruptcy proceedings, your information may be shared
                                with potential or actual acquirers or investors and their agents.
                            </p>
                        </section>

                        {/* Data retention */}
                        <section id="section-data-retention" className="py-8 border-b border-edge scroll-mt-20">
                            <h2 className="text-lg font-bold text-foreground mb-4">Data retention</h2>
                            <p className="text-sm text-dimmed leading-relaxed mb-3">
                                We retain your information for as long as necessary to provide you with our services, to
                                comply with our legal obligations, to resolve disputes, to enforce our agreements or to
                                protect our legal interests.
                            </p>
                            <p className="text-sm text-dimmed leading-relaxed mb-3">
                                Your data will only be kept for as long as you maintain an account with us.
                            </p>
                            <p className="text-sm text-dimmed leading-relaxed">
                                Your data at the end of the retention period will be deleted or anonymized where possible,
                                or if this is not possible, then securely stored and isolated from any further processing
                                until deletion is possible.
                            </p>
                        </section>

                        {/* Privacy rights */}
                        <section id="section-privacy-rights" className="py-8 border-b border-edge scroll-mt-20">
                            <h2 className="text-lg font-bold text-foreground mb-4">Your privacy rights</h2>
                            <p className="text-sm text-dimmed leading-relaxed mb-3">
                                You have the right to access, update or delete your personal information. You can also
                                object to the processing of your personal information, ask us to restrict processing of
                                your personal information or request portability of your personal information.
                            </p>
                            <p className="text-sm text-dimmed leading-relaxed mb-3">
                                You can access, update or delete your personal information by contacting us at{' '}
                                <a href="mailto:" className="text-primary hover:underline transition-colors"></a>.
                            </p>
                            <p className="text-sm text-dimmed leading-relaxed">
                                You can object to the processing of your personal information, ask us to restrict
                                processing of your personal information or request portability of your personal information
                                by contacting us at{' '}
                                <a href="mailto:" className="text-primary hover:underline transition-colors"></a>.
                            </p>
                        </section>

                        {/* Policy changes */}
                        <section id="section-privacy-policy-changes" className="py-8 border-b border-edge scroll-mt-20">
                            <h2 className="text-lg font-bold text-foreground mb-4">
                                Changes to our privacy policy
                            </h2>
                            <p className="text-sm text-dimmed leading-relaxed">
                                We may update this privacy policy from time to time. The updated version will be indicated
                                by an updated &#34;Revised&#34; date and the updated version will be effective as soon as
                                it is accessible. If we make material changes to this privacy policy, we may notify you
                                either by prominently posting a notice of such changes or by directly sending you a
                                notification. We encourage you to review this privacy policy frequently to be informed of
                                how we are protecting your information.
                            </p>
                        </section>

                        {/* Contact */}
                        <section id="section-contact" className="py-8 scroll-mt-20">
                            <h2 className="text-lg font-bold text-foreground mb-4">Contact us</h2>
                            <p className="text-sm text-dimmed leading-relaxed mb-3">
                                If you have questions or comments about this privacy policy, you can contact us at{' '}
                                <a href="mailto:" className="text-primary hover:underline transition-colors"></a>.
                            </p>
                            <p className="text-sm text-dimmed leading-relaxed">Obscurus</p>
                        </section>

                    </div>
                </div>
            </div>
        </main>
    )
}

export default Page

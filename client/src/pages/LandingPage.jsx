import React, {useState} from 'react';
import {
    ArrowRight,
    BarChart3,
    CheckCircle,
    Clock,
    MessageCircle,
    Play,
    Shield,
    Star,
    Target,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import {useNavigate} from "react-router-dom";

const LandingPage = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [hoveredFeature, setHoveredFeature] = useState(null);
    const navigate = useNavigate();

    const features = [
        {
            icon: <MessageCircle className="w-8 h-8"/>,
            title: 'Automated Messaging',
            description: 'Send personalized messages to thousands instantly with intelligent automation.',
            details: 'AI-powered message scheduling, template management, and smart delivery optimization.'
        },
        {
            icon: <Target className="w-8 h-8"/>,
            title: 'Campaign Management',
            description: 'Centralize all your marketing operations in one powerful dashboard.',
            details: 'Multi-channel campaigns, A/B testing, and advanced segmentation tools.'
        },
        {
            icon: <TrendingUp className="w-8 h-8"/>,
            title: 'Cost Reduction',
            description: 'Minimize costs by eliminating repetitive manual work.',
            details: 'Save up to 80% on communication costs with automated workflows.'
        },
        {
            icon: <Zap className="w-8 h-8"/>,
            title: 'Seamless Integration',
            description: 'Integrate easily with your existing systems and tools.',
            details: 'Connect with CRM, e-commerce platforms, and 500+ business tools.'
        },
        {
            icon: <BarChart3 className="w-8 h-8"/>,
            title: 'Analytics & Insights',
            description: 'Track performance with real-time analytics and reports.',
            details: 'Advanced reporting, conversion tracking, and ROI measurement.'
        },
        {
            icon: <Shield className="w-8 h-8"/>,
            title: 'Scalable & Secure',
            description: 'Built to scale with enterprise-grade security.',
            details: 'End-to-end encryption, GDPR compliance, and 99.9% uptime.'
        }
    ];

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Marketing Director",
            company: "TechFlow Solutions",
            rating: 5,
            text: "MyWabot transformed our customer engagement. We saw a 300% increase in response rates within the first month!"
        },
        {
            name: "Michael Chen",
            role: "E-commerce Owner",
            company: "ShopSmart",
            rating: 5,
            text: "The automation saved us 40 hours per week. Our customer support is now 24/7 without additional staff."
        },
        {
            name: "Emily Rodriguez",
            role: "Operations Manager",
            company: "EduTech Pro",
            rating: 5,
            text: "Students love getting instant updates. Our engagement rates increased by 250% after implementing MyWabot."
        }
    ];

    const pricingPlans = [
        {
            name: "Starter",
            price: "999rs",
            period: "per month",
            features: ["Up to 1,000 messages/month", "Basic automation", "Email support", "Dashboard analytics"],
            recommended: false
        },
        {
            name: "Professional",
            price: "1899rs",
            period: "per month",
            features: ["Up to 10,000 messages/month", "Advanced automation", "Priority support", "Custom integrations", "A/B testing"],
            recommended: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            period: "contact us",
            features: ["Unlimited messages", "White-label solution", "Dedicated support", "Custom development", "SLA guarantee"],
            recommended: false
        }
    ];

    return (
        <div className="bg-white text-gray-900 font-sans overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div
                            className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-white"/>
                        </div>
                        <span
                            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MyWabot</span>
                    </div>
                    <div className="hidden md:flex space-x-8">
                        <a href="#features" className="text-gray-700 hover:text-blue-600 transition">Features</a>
                        <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition">Pricing</a>
                        <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition">Reviews</a>
                        <a href="#contact" className="text-gray-700 hover:text-blue-600 transition">Contact</a>
                    </div>
                    <button onClick={() => navigate('/signup')}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300">
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section
                className="min-h-screen flex flex-col justify-center items-center text-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6 py-24 pt-32 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div
                        className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full animate-pulse"></div>
                    <div
                        className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-100/30 to-transparent rounded-full animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto">
                    <div
                        className="mb-6 inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                        <Zap className="w-4 h-4"/>
                        {/*<span>Trusted by 10,000+ businesses worldwide</span>*/}
                        <span>Currently onboarding businesses worldwide</span>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                        Automate Your <br/>
                        <span
                            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Business with Messaging
                        </span>
                    </h1>

                    <p className="text-xl text-gray-600 max-w-3xl mb-8 leading-relaxed">
                        Transform your customer communication with AI-powered WA automation.
                        Increase engagement by 300%, reduce costs by 80%, and scale your business effortlessly.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                        <button
                            className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                            onClick={() => navigate('/signup')}
                        >
                            <span>Start Free Trial</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                        </button>
                        <button
                            className="group flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
                            <div
                                className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow">
                                <Play className="w-5 h-5 ml-1"/>
                            </div>
                            <span className="font-medium">Watch Demo</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">10K+</div>
                            <div className="text-gray-600">Active Users</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">99.9%</div>
                            <div className="text-gray-600">Uptime</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-pink-600">50M+</div>
                            <div className="text-gray-600">Messages Sent</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold mb-6">
                            Why Choose <span className="text-blue-600">MyWabot</span>?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Empower your business with cutting-edge WhatsApp automation features designed for modern
                            enterprises
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group relative bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                                onMouseEnter={() => setHoveredFeature(index)}
                                onMouseLeave={() => setHoveredFeature(null)}
                            >
                                <div
                                    className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative z-10">
                                    <div
                                        className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                                    <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                                    <p className="text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {feature.details}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases with Interactive Tabs */}
            <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold mb-6">Powerful Use Cases</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Discover how MyWabot transforms businesses across different industries
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                        <div className="flex flex-wrap border-b">
                            {['Customer Support', 'Sales & Marketing', 'Education', 'E-commerce'].map((tab, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTab(index)}
                                    className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-300 ${
                                        activeTab === index
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="p-12">
                            {activeTab === 0 && (
                                <div className="grid md:grid-cols-2 gap-12 items-center">
                                    <div>
                                        <h3 className="text-3xl font-bold mb-6">24/7 Customer Support</h3>
                                        <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                                            Automate customer support with intelligent chatbots that handle 80% of
                                            queries instantly.
                                            Reduce response time from hours to seconds.
                                        </p>
                                        <ul className="space-y-3">
                                            <li className="flex items-center space-x-3">
                                                <CheckCircle className="w-5 h-5 text-green-500"/>
                                                <span>Instant query resolution</span>
                                            </li>
                                            <li className="flex items-center space-x-3">
                                                <CheckCircle className="w-5 h-5 text-green-500"/>
                                                <span>Multi-language support</span>
                                            </li>
                                            <li className="flex items-center space-x-3">
                                                <CheckCircle className="w-5 h-5 text-green-500"/>
                                                <span>Seamless human handoff</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div
                                        className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 text-center">
                                        <div
                                            className="w-32 h-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                                            <MessageCircle className="w-16 h-16 text-blue-600"/>
                                        </div>
                                        <div className="text-2xl font-bold text-blue-600">80%</div>
                                        <div className="text-gray-600">Queries Automated</div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 1 && (
                                <div className="grid md:grid-cols-2 gap-12 items-center">
                                    <div>
                                        <h3 className="text-3xl font-bold mb-6">Smart Sales Campaigns</h3>
                                        <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                                            Launch targeted marketing campaigns with personalized messages.
                                            Achieve higher conversion rates with smart segmentation.
                                        </p>
                                        <ul className="space-y-3">
                                            <li className="flex items-center space-x-3">
                                                <CheckCircle className="w-5 h-5 text-green-500"/>
                                                <span>Personalized messaging</span>
                                            </li>
                                            <li className="flex items-center space-x-3">
                                                <CheckCircle className="w-5 h-5 text-green-500"/>
                                                <span>Advanced segmentation</span>
                                            </li>
                                            <li className="flex items-center space-x-3">
                                                <CheckCircle className="w-5 h-5 text-green-500"/>
                                                <span>A/B campaign testing</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div
                                        className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-8 text-center">
                                        <div
                                            className="w-32 h-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                                            <Target className="w-16 h-16 text-green-600"/>
                                        </div>
                                        <div className="text-2xl font-bold text-green-600">300%</div>
                                        <div className="text-gray-600">Higher Engagement</div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 2 && (
                                <div className="grid md:grid-cols-2 gap-12 items-center">
                                    <div>
                                        <h3 className="text-3xl font-bold mb-6">Educational Excellence</h3>
                                        <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                                            Keep students engaged with automated course updates, reminders, and
                                            interactive content delivery.
                                        </p>
                                        <ul className="space-y-3">
                                            <li className="flex items-center space-x-3">
                                                <CheckCircle className="w-5 h-5 text-green-500"/>
                                                <span>Automated reminders</span>
                                            </li>
                                            <li className="flex items-center space-x-3">
                                                <CheckCircle className="w-5 h-5 text-green-500"/>
                                                <span>Course material delivery</span>
                                            </li>
                                            <li className="flex items-center space-x-3">
                                                <CheckCircle className="w-5 h-5 text-green-500"/>
                                                <span>Student progress tracking</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div
                                        className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 text-center">
                                        <div
                                            className="w-32 h-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                                            <Users className="w-16 h-16 text-purple-600"/>
                                        </div>
                                        <div className="text-2xl font-bold text-purple-600">95%</div>
                                        <div className="text-gray-600">Student Satisfaction</div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 3 && (
                                <div className="grid md:grid-cols-2 gap-12 items-center">
                                    <div>
                                        <h3 className="text-3xl font-bold mb-6">E-commerce Automation</h3>
                                        <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                                            Automate order confirmations, shipping updates, and cart abandonment
                                            recovery to boost sales.
                                        </p>
                                        <ul className="space-y-3">
                                            <li className="flex items-center space-x-3">
                                                <CheckCircle className="w-5 h-5 text-green-500"/>
                                                <span>Order tracking automation</span>
                                            </li>
                                            <li className="flex items-center space-x-3">
                                                <CheckCircle className="w-5 h-5 text-green-500"/>
                                                <span>Cart recovery campaigns</span>
                                            </li>
                                            <li className="flex items-center space-x-3">
                                                <CheckCircle className="w-5 h-5 text-green-500"/>
                                                <span>Product recommendations</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div
                                        className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-8 text-center">
                                        <div
                                            className="w-32 h-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                                            <TrendingUp className="w-16 h-16 text-orange-600"/>
                                        </div>
                                        <div className="text-2xl font-bold text-orange-600">40%</div>
                                        <div className="text-gray-600">Sales Increase</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-24 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold mb-6">What Our Customers Say</h2>
                        <p className="text-xl text-gray-600">Don't just take our word for it - hear from businesses that
                            transformed their communication</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index}
                                 className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current"/>
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 text-lg leading-relaxed">"{testimonial.text}"</p>
                                <div className="flex items-center">
                                    <div
                                        className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                        <div
                                            className="text-gray-600 text-sm">{testimonial.role}, {testimonial.company}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-24 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
                        <p className="text-xl text-gray-600">Choose the perfect plan for your business needs</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {pricingPlans.map((plan, index) => (
                            <div key={index}
                                 className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${plan.recommended ? 'ring-2 ring-blue-600 transform scale-105' : ''}`}>
                                {plan.recommended && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                <div className="p-8">
                                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold">{plan.price}</span>
                                        <span className="text-gray-600 ml-2">{plan.period}</span>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature, fIndex) => (
                                            <li key={fIndex} className="flex items-center space-x-3">
                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0"/>
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                                            plan.recommended
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
                                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                        }`}>
                                        {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Indicators */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-12">Trusted by Leading Companies</h2>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-60">
                        {['TechieFlow', 'ShopsSmart', 'EdumTech', 'Eventury', 'SupportOurMart', 'GrowthxCo'].map((company, index) => (
                            <div key={index}
                                 className="text-2xl font-bold text-gray-400 hover:text-blue-600 transition-colors cursor-pointer">
                                {company}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section id="contact" className="py-24 px-6 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-5xl font-bold mb-6">Ready to Transform Your Business?</h2>
                    <p className="text-xl mb-12 opacity-90">Join thousands of businesses already using MyWabot to
                        automate their WhatsApp communication</p>

                    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl mx-auto">
                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    className="w-full p-4 rounded-xl bg-white/20 placeholder-white/70 text-white border border-white/20 focus:border-white/50 focus:outline-none transition-colors"
                                />
                                <input
                                    type="email"
                                    placeholder="Your Email"
                                    className="w-full p-4 rounded-xl bg-white/20 placeholder-white/70 text-white border border-white/20 focus:border-white/50 focus:outline-none transition-colors"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Company Name"
                                className="w-full p-4 rounded-xl bg-white/20 placeholder-white/70 text-white border border-white/20 focus:border-white/50 focus:outline-none transition-colors"
                            />
                            <textarea
                                placeholder="Tell us about your business needs"
                                rows={4}
                                className="w-full p-4 rounded-xl bg-white/20 placeholder-white/70 text-white border border-white/20 focus:border-white/50 focus:outline-none transition-colors resize-none"
                            ></textarea>
                            <button
                                type="submit"
                                className="w-full bg-white text-blue-600 py-4 px-8 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-lg"
                            >
                                Start Your Free Trial
                            </button>
                        </form>
                    </div>

                    <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <Clock className="w-8 h-8 mx-auto mb-3 opacity-80"/>
                            <div className="font-semibold">Quick Setup</div>
                            <div className="text-sm opacity-70">Get started in 5 minutes</div>
                        </div>
                        <div>
                            <Shield className="w-8 h-8 mx-auto mb-3 opacity-80"/>
                            <div className="font-semibold">Secure & Compliant</div>
                            <div className="text-sm opacity-70">Enterprise-grade security</div>
                        </div>
                        <div>
                            <Users className="w-8 h-8 mx-auto mb-3 opacity-80"/>
                            <div className="font-semibold">24/7 Support</div>
                            <div className="text-sm opacity-70">Always here to help</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div>
                            <div className="flex items-center space-x-2 mb-6">
                                <div
                                    className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <MessageCircle className="w-5 h-5 text-white"/>
                                </div>
                                <span
                                    className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">MyWabot</span>
                            </div>
                            <p className="text-gray-400 mb-6">Revolutionizing WhatsApp business communication with
                                AI-powered automation.</p>
                            <div className="flex space-x-4">
                                <div
                                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                                    <MessageCircle className="w-5 h-5"/>
                                </div>
                                <div
                                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                                    <Users className="w-5 h-5"/>
                                </div>
                                <div
                                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                                    <Target className="w-5 h-5"/>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-6">Product</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-6">Company</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-6">Resources</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Webinars</a></li>
                            </ul>
                        </div>
                    </div>

                    <div
                        className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <div className="text-gray-400 text-sm mb-4 md:mb-0">
                            © 2025 MyWabot. All rights reserved.
                        </div>
                        <div className="flex space-x-6 text-sm text-gray-400">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
export default LandingPage;

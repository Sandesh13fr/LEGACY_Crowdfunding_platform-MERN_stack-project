import React from 'react';
import { Heart, Users, Target } from 'lucide-react';

function About() {
  return (
    <div className="pt-24 w-screen">
      {/* Hero Section */}
      <section className="py-20 bg-emerald-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-800 mb-6">About Legacy</h1>
            <p className="text-xl text-gray-600">
              Creating lasting change through compassion, innovation, and community engagement.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To empower communities through sustainable development initiatives, providing resources and support that create lasting positive change in people's lives.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                A world where every individual has access to the resources and opportunities they need to thrive and create their own legacy of positive impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-emerald-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-16">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Compassion",
                description: "We lead with empathy and understanding in everything we do."
              },
              {
                icon: Users,
                title: "Community",
                description: "We believe in the power of people coming together to create change."
              },
              {
                icon: Target,
                title: "Impact",
                description: "We focus on creating measurable, sustainable positive outcomes."
              }
            ].map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-16">Our Leadership Team</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                name: "Lorem Ipsum",
                role: "Executive Director"
              },
              {
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpohbzlvf_TnIW6Ez-X8oRJiSBFSQq4fBU_A&s",
                name: "Lorem Ipsum",
                role: "Operations Director"
              },
              {
                image: "https://images.unsplash.com/photo-1544502062-f82887f03d1c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDV8fHxlbnwwfHx8fHw%3D",
                name: "Lorem Ipsum",
                role: "Programs Manager"
              },
              {
                image: "https://images.unsplash.com/photo-1614248440717-115c4b39ed9b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDI1fHx8ZW58MHx8fHx8",
                name: "Lorem Ipsum",
                role: "Development Director"
              }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-48 h-48 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;